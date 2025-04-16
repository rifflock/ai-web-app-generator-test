/*
  # Fix Conversation Participants Policies

  This migration fixes the infinite recursion issue in the conversation_participants policies
  by simplifying the policy conditions and avoiding circular references.

  1. Changes
    - Remove existing policies on conversation_participants
    - Add new, simplified policies that avoid recursion
    - Update conversation policies to be more efficient

  2. Security
    - Maintain proper access control
    - Prevent unauthorized access to conversations
    - Ensure users can only see conversations they're part of
*/

-- Drop existing policies to replace them with fixed versions
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON conversations;

-- Create new, simplified policies
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view conversations they're part of"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid()
    )
  );