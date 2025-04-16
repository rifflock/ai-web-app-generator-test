-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL, -- 'regular', 'special', 'workshop'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  max_participants INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session series for multi-week sessions
CREATE TABLE session_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  day_of_week INTEGER[], -- 0 = Sunday, 1 = Monday, etc.
  time_of_day TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  location TEXT,
  max_participants INTEGER,
  price_per_session DECIMAL(10, 2) NOT NULL,
  total_sessions INTEGER NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  series_id UUID REFERENCES session_series(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'confirmed', 'cancelled', 'waitlisted'
  payment_status TEXT NOT NULL, -- 'paid', 'pending', 'refunded'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((session_id IS NULL AND series_id IS NOT NULL) OR (session_id IS NOT NULL AND series_id IS NULL))
);

-- Attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'present', 'absent', 'late'
  check_in_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'session', 'subscription', 'donation'
  payment_method TEXT NOT NULL, -- 'credit_card', 'bank_transfer', 'cash'
  status TEXT NOT NULL, -- 'completed', 'pending', 'failed', 'refunded'
  transaction_id TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  campaign TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Sessions are viewable by everyone" 
ON sessions FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Attendance policies
CREATE POLICY "Users can view their own attendance" 
ON attendance FOR SELECT USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" 
ON payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" 
ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Donations policies
CREATE POLICY "Users can view their own donations" 
ON donations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donations" 
ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create admin role for managing all records
CREATE ROLE admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies to all tables
CREATE POLICY "Admins can do everything with sessions" 
ON sessions USING (is_admin());

CREATE POLICY "Admins can do everything with bookings" 
ON bookings USING (is_admin());

CREATE POLICY "Admins can do everything with attendance" 
ON attendance USING (is_admin());

CREATE POLICY "Admins can do everything with payments" 
ON payments USING (is_admin());

CREATE POLICY "Admins can do everything with donations" 
ON donations USING (is_admin());

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

