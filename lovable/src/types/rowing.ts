export interface Session {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  coach_id: string | null;
  session_type: 'regular' | 'one_off';
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  session_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount_cents: number;
  payment_type: 'session_purchase' | 'membership' | 'donation';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  sessions_included: number;
  price_cents: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPackage {
  id: string;
  user_id: string;
  package_id: string;
  payment_id: string | null;
  sessions_remaining: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Crew {
  id: string;
  name: string;
  description: string | null;
  skill_level_id: string | null;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface CrewMember {
  id: string;
  crew_id: string;
  user_id: string;
  is_leader: boolean;
  joined_at: string;
}

export interface CrewSession {
  id: string;
  crew_id: string;
  session_id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  session?: Session;
}

export interface CrewSessionAttendance {
  id: string;
  crew_session_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface SkillLevel {
  id: string;
  name: string;
  level_order: number;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_level_id: string;
  created_at: string;
  updated_at: string;
  skill_level?: SkillLevel;
}

export interface UserAvailability {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}
