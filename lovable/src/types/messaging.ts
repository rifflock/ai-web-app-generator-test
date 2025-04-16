
export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
}
