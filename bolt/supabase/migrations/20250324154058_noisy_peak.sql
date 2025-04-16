/*
  # Initial Schema for Rowing Club Manager

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, matches auth.users)
      - `email` (text)
      - `full_name` (text)
      - `experience_level` (text)
      - `years_rowing` (integer)
      - `preferred_position` (text)
      - `availability` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
      - Insert their own profile
*/

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  experience_level text CHECK (experience_level IN ('novice', 'intermediate', 'advanced', 'elite')),
  years_rowing integer DEFAULT 0,
  preferred_position text CHECK (preferred_position IN ('bow', 'stroke', 'port', 'starboard', 'cox', 'any')),
  availability jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);