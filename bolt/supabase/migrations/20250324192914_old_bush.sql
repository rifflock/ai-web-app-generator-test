/*
  # Create sessions and payments tables

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `capacity` (integer)
      - `price` (integer, in cents)
      - `session_type` (enum: 'multi_week', 'single', 'donation')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `registrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_id` (uuid, references sessions)
      - `status` (enum: 'pending', 'confirmed', 'cancelled')
      - `payment_status` (enum: 'pending', 'paid', 'refunded')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `registration_id` (uuid, references registrations)
      - `amount` (integer, in cents)
      - `status` (enum: 'pending', 'succeeded', 'failed', 'refunded')
      - `stripe_payment_intent_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create session_type enum
CREATE TYPE session_type AS ENUM ('multi_week', 'single', 'donation');

-- Create registration_status enum
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create payment_status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  capacity integer NOT NULL DEFAULT 8,
  price integer NOT NULL,
  session_type session_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sessions_dates_check CHECK (end_date >= start_date),
  CONSTRAINT sessions_capacity_check CHECK (capacity > 0),
  CONSTRAINT sessions_price_check CHECK (price >= 0)
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  session_id uuid NOT NULL REFERENCES sessions(id),
  status registration_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id),
  amount integer NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT payments_amount_check CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Anyone can view sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Registrations policies
CREATE POLICY "Users can view own registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own registrations"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
  ON registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = payments.registration_id
      AND registrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for own registrations"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.id = registration_id
      AND registrations.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();