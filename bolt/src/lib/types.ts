export interface Session {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  price: number;
  session_type: 'multi_week' | 'single' | 'donation';
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_id: string;
  session_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  session?: Session;
}

export interface Payment {
  id: string;
  registration_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'refunded';
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  experience_level: 'novice' | 'intermediate' | 'advanced' | 'elite';
  years_rowing: number;
  preferred_position: 'bow' | 'stroke' | 'port' | 'starboard' | 'cox' | 'any';
  availability: Record<string, boolean[]>;
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
  sender?: Profile;
}

export interface Conversation {
  id: string;
  name: string | null;
  type: 'direct' | 'group';
  created_at: string;
  updated_at: string;
  participants?: Profile[];
  last_message?: Message;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  profile?: Profile;
}

export interface Crew {
  id: string;
  name: string;
  session_id: string;
  skill_level: 'novice' | 'intermediate' | 'advanced' | 'elite';
  status: 'forming' | 'complete' | 'disbanded';
  created_at: string;
  updated_at: string;
  session?: Session;
  assignments?: CrewAssignment[];
}

export interface CrewAssignment {
  crew_id: string;
  user_id: string;
  position: 'bow' | 'stroke' | 'port' | 'starboard' | 'cox';
  status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
  updated_at: string;
  profile?: Profile;
  crew?: Crew;
}