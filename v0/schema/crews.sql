-- Crews table
CREATE TABLE crews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- '1x', '2x', '4x', '8+', etc.
  skill_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'elite'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crew memberships table
CREATE TABLE crew_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position TEXT NOT NULL, -- 'bow', '2', '3', '4', '5', '6', '7', 'stroke', 'cox'
  is_captain BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(crew_id, user_id, position) WHERE left_at IS NULL
);

-- Crew sessions table
CREATE TABLE crew_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT, -- 'weekly', 'biweekly', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crew session confirmations
CREATE TABLE crew_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_session_id UUID NOT NULL REFERENCES crew_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'confirmed', 'declined', 'pending'
  response_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  UNIQUE(crew_session_id, user_id)
);

-- Crew matching requests
CREATE TABLE crew_matching_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_crew_type TEXT NOT NULL, -- '1x', '2x', '4x', '8+', etc.
  preferred_skill_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'elite'
  preferred_position TEXT, -- 'bow', '2', '3', '4', '5', '6', '7', 'stroke', 'cox'
  preferred_days INTEGER[], -- 0 = Sunday, 1 = Monday, etc.
  preferred_time_start TIME,
  preferred_time_end TIME,
  is_flexible BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'matched', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_matching_requests ENABLE ROW LEVEL SECURITY;

-- Crews policies
CREATE POLICY "Crews are viewable by everyone" 
ON crews FOR SELECT USING (true);

-- Crew memberships policies
CREATE POLICY "Users can view all crew memberships" 
ON crew_memberships FOR SELECT USING (true);

CREATE POLICY "Users can view their own crew memberships" 
ON crew_memberships FOR SELECT USING (auth.uid() = user_id);

-- Crew sessions policies
CREATE POLICY "Users can view sessions for crews they belong to" 
ON crew_sessions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM crew_memberships 
    WHERE crew_id = crew_sessions.crew_id 
    AND user_id = auth.uid() 
    AND left_at IS NULL
  )
);

-- Crew confirmations policies
CREATE POLICY "Users can view their own confirmations" 
ON crew_confirmations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own confirmations" 
ON crew_confirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confirmations" 
ON crew_confirmations FOR UPDATE USING (auth.uid() = user_id);

-- Crew matching requests policies
CREATE POLICY "Users can view their own matching requests" 
ON crew_matching_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matching requests" 
ON crew_matching_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matching requests" 
ON crew_matching_requests FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can do everything with crews" 
ON crews USING (is_admin());

CREATE POLICY "Admins can do everything with crew memberships" 
ON crew_memberships USING (is_admin());

CREATE POLICY "Admins can do everything with crew sessions" 
ON crew_sessions USING (is_admin());

CREATE POLICY "Admins can do everything with crew confirmations" 
ON crew_confirmations USING (is_admin());

CREATE POLICY "Admins can do everything with crew matching requests" 
ON crew_matching_requests USING (is_admin());

-- Create function to match crews based on requests
CREATE OR REPLACE FUNCTION match_crews()
RETURNS SETOF UUID AS $$
DECLARE
  new_crew_id UUID;
  request_ids UUID[];
  request_record RECORD;
  user_id UUID;
  crew_type TEXT;
  skill_level TEXT;
  crew_size INTEGER;
  matched_count INTEGER := 0;
  position_index INTEGER;
  positions TEXT[];
BEGIN
  -- Process each crew type separately
  FOR crew_type, skill_level IN 
    SELECT DISTINCT preferred_crew_type, preferred_skill_level 
    FROM crew_matching_requests 
    WHERE status = 'pending'
    GROUP BY preferred_crew_type, preferred_skill_level
  LOOP
    -- Determine crew size based on crew type
    CASE crew_type
      WHEN '1x' THEN crew_size := 1;
      WHEN '2x' THEN crew_size := 2;
      WHEN '4x' THEN crew_size := 4;
      WHEN '8+' THEN crew_size := 9; -- 8 rowers + cox
      ELSE crew_size := 0;
    END CASE;
    
    -- Skip if invalid crew size
    IF crew_size = 0 THEN
      CONTINUE;
    END IF;
    
    -- Get pending requests for this crew type and skill level
    request_ids := ARRAY(
      SELECT id FROM crew_matching_requests
      WHERE preferred_crew_type = crew_type
      AND preferred_skill_level = skill_level
      AND status = 'pending'
      ORDER BY created_at
      LIMIT crew_size
    );
    
    -- If we have enough people for a crew, create it
    IF array_length(request_ids, 1) = crew_size THEN
      -- Create new crew
      INSERT INTO crews (name, type, skill_level, description)
      VALUES (
        'Auto-matched ' || crew_type || ' (' || skill_level || ')',
        crew_type,
        skill_level,
        'Automatically matched crew based on preferences'
      )
      RETURNING id INTO new_crew_id;
      
      -- Determine positions based on crew type
      CASE crew_type
        WHEN '1x' THEN positions := ARRAY['single'];
        WHEN '2x' THEN positions := ARRAY['bow', 'stroke'];
        WHEN '4x' THEN positions := ARRAY['bow', '2', '3', 'stroke'];
        WHEN '8+' THEN positions := ARRAY['bow', '2', '3', '4', '5', '6', '7', 'stroke', 'cox'];
        ELSE positions := ARRAY[]::TEXT[];
      END CASE;
      
      -- Add members to crew
      position_index := 1;
      FOREACH request_record IN ARRAY (
        SELECT * FROM crew_matching_requests
        WHERE id = ANY(request_ids)
      )
      LOOP
        -- Assign position based on preference or next available
        INSERT INTO crew_memberships (crew_id, user_id, position, is_captain)
        VALUES (
          new_crew_id, 
          request_record.user_id, 
          COALESCE(
            NULLIF(request_record.preferred_position, ''), 
            positions[position_index]
          ),
          position_index = 1 -- First person is captain
        );
        
        -- Update request status
        UPDATE crew_matching_requests
        SET status = 'matched', updated_at = NOW()
        WHERE id = request_record.id;
        
        position_index := position_index + 1;
        matched_count := matched_count + 1;
      END LOOP;
      
      -- Return the new crew ID
      RETURN NEXT new_crew_id;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

