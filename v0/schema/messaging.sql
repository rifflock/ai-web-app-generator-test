-- Conversations table (for both 1-on-1 and group chats)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT, -- NULL for direct messages, name for group chats
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Conversation participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  attachment_url TEXT,
  attachment_type TEXT
);

-- Read receipts
CREATE TABLE message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Add RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view conversations they are part of" 
ON conversations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Conversation participants policies
CREATE POLICY "Users can view participants of their conversations" 
ON conversation_participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants AS cp
    WHERE cp.conversation_id = conversation_participants.conversation_id 
    AND cp.user_id = auth.uid() AND cp.left_at IS NULL
  )
);

CREATE POLICY "Users can add participants to conversations they admin" 
ON conversation_participants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_participants.conversation_id 
    AND user_id = auth.uid() AND is_admin = true AND left_at IS NULL
  )
);

-- Messages policies
CREATE POLICY "Users can view messages from their conversations" 
ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can send messages to their conversations" 
ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
  )
);

CREATE POLICY "Users can edit their own messages" 
ON messages FOR UPDATE USING (auth.uid() = sender_id);

-- Read receipts policies
CREATE POLICY "Users can view read receipts from their conversations" 
ON message_reads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM messages 
    JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
    WHERE messages.id = message_reads.message_id 
    AND conversation_participants.user_id = auth.uid() 
    AND conversation_participants.left_at IS NULL
  )
);

CREATE POLICY "Users can mark messages as read" 
ON message_reads FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM messages 
    JOIN conversation_participants ON messages.conversation_id = conversation_participants.conversation_id
    WHERE messages.id = message_reads.message_id 
    AND conversation_participants.user_id = auth.uid() 
    AND conversation_participants.left_at IS NULL
  )
);

-- Create function to get or create a direct message conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_dm_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Check if a DM conversation already exists between these users
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants p1 ON c.id = p1.conversation_id
  JOIN conversation_participants p2 ON c.id = p2.conversation_id
  WHERE c.is_group = false
    AND p1.user_id = user1_id AND p1.left_at IS NULL
    AND p2.user_id = user2_id AND p2.left_at IS NULL
    AND (SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id AND left_at IS NULL) = 2;
  
  -- If no conversation exists, create one
  IF conv_id IS NULL THEN
    -- Create the conversation
    INSERT INTO conversations (is_group, created_by)
    VALUES (false, user1_id)
    RETURNING id INTO conv_id;
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id, is_admin)
    VALUES (conv_id, user1_id, true), (conv_id, user2_id, false);
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS TABLE (conversation_id UUID, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT m.conversation_id, COUNT(m.id) AS unread_count
  FROM messages m
  JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
  LEFT JOIN message_reads mr ON m.id = mr.message_id AND mr.user_id = user_id
  WHERE cp.user_id = user_id
    AND cp.left_at IS NULL
    AND m.sender_id != user_id
    AND mr.id IS NULL
  GROUP BY m.conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

