/*
  # Add Crew Matching System

  1. New Tables
    - `crews`
      - `id` (uuid, primary key)
      - `name` (text)
      - `session_id` (uuid, references sessions)
      - `skill_level` (text)
      - `status` (enum: 'forming', 'complete', 'disbanded')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `crew_assignments`
      - `crew_id` (uuid, references crews)
      - `user_id` (uuid, references profiles)
      - `position` (text)
      - `status` (enum: 'pending', 'confirmed', 'declined')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for crew management
*/

-- Create crew status enum
CREATE TYPE crew_status AS ENUM ('forming', 'complete', 'disbanded');

-- Create crew assignment status enum
CREATE TYPE crew_assignment_status AS ENUM ('pending', 'confirmed', 'declined');

-- Create crews table
CREATE TABLE IF NOT EXISTS crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  skill_level text CHECK (skill_level IN ('novice', 'intermediate', 'advanced', 'elite')),
  status crew_status NOT NULL DEFAULT 'forming',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create crew assignments table
CREATE TABLE IF NOT EXISTS crew_assignments (
  crew_id uuid REFERENCES crews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  position text CHECK (position IN ('bow', 'stroke', 'port', 'starboard', 'cox')),
  status crew_assignment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (crew_id, user_id)
);

-- Enable RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;

-- Crews policies
CREATE POLICY "Users can view crews for their sessions"
  ON crews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.session_id = crews.session_id
      AND registrations.user_id = auth.uid()
      AND registrations.status = 'confirmed'
    )
  );

-- Crew assignments policies
CREATE POLICY "Users can view their crew assignments"
  ON crew_assignments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM crews c
      JOIN registrations r ON r.session_id = c.session_id
      WHERE c.id = crew_assignments.crew_id
      AND r.user_id = auth.uid()
      AND r.status = 'confirmed'
    )
  );

CREATE POLICY "Users can update their own crew assignments"
  ON crew_assignments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add triggers for updating timestamps
CREATE TRIGGER update_crews_updated_at
  BEFORE UPDATE ON crews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crew_assignments_updated_at
  BEFORE UPDATE ON crew_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();