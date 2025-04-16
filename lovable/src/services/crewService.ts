
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Crew, 
  CrewMember, 
  CrewSession, 
  CrewSessionAttendance, 
  SkillLevel,
  UserSkill,
  UserAvailability,
  Session
} from "@/types/rowing";
import { formatDateTime } from "./rowingService";

// Skill level functions
export async function getSkillLevels() {
  try {
    const { data, error } = await supabase
      .from('skill_levels')
      .select('*')
      .order('level_order');
      
    if (error) throw error;
    return data as SkillLevel[];
  } catch (error) {
    console.error("Error fetching skill levels:", error);
    toast.error("Failed to load skill levels");
    return [];
  }
}

export async function getUserSkill() {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        *,
        skill_level:skill_level_id(*)
      `)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as UserSkill;
  } catch (error) {
    console.error("Error fetching user skill:", error);
    toast.error("Failed to load user skill level");
    return null;
  }
}

export async function setUserSkill(skillLevelId: string) {
  try {
    const { data: existingSkill } = await supabase
      .from('user_skills')
      .select('*')
      .single();

    if (existingSkill) {
      // Update existing skill
      const { data, error } = await supabase
        .from('user_skills')
        .update({ skill_level_id: skillLevelId })
        .eq('id', existingSkill.id)
        .select()
        .single();

      if (error) throw error;
      toast.success("Skill level updated");
      return data as UserSkill;
    } else {
      // Create new skill
      const { data, error } = await supabase
        .from('user_skills')
        .insert({ 
          user_id: (await supabase.auth.getUser()).data.user?.id,
          skill_level_id: skillLevelId 
        })
        .select()
        .single();

      if (error) throw error;
      toast.success("Skill level set");
      return data as UserSkill;
    }
  } catch (error) {
    console.error("Error setting user skill:", error);
    toast.error("Failed to set skill level");
    throw error;
  }
}

// Availability functions
export async function getUserAvailability() {
  try {
    const { data, error } = await supabase
      .from('user_availability')
      .select('*')
      .order('day_of_week')
      .order('start_time');
      
    if (error) throw error;
    return data as UserAvailability[];
  } catch (error) {
    console.error("Error fetching user availability:", error);
    toast.error("Failed to load availability");
    return [];
  }
}

export async function addUserAvailability(dayOfWeek: number, startTime: string, endTime: string) {
  try {
    const { data, error } = await supabase
      .from('user_availability')
      .insert({ 
        user_id: (await supabase.auth.getUser()).data.user?.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime
      })
      .select()
      .single();
      
    if (error) throw error;
    toast.success("Availability added");
    return data as UserAvailability;
  } catch (error) {
    console.error("Error adding availability:", error);
    toast.error("Failed to add availability");
    throw error;
  }
}

export async function removeUserAvailability(id: string) {
  try {
    const { error } = await supabase
      .from('user_availability')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    toast.success("Availability removed");
    return true;
  } catch (error) {
    console.error("Error removing availability:", error);
    toast.error("Failed to remove availability");
    throw error;
  }
}

// Crew functions
export async function getUserCrews() {
  try {
    const { data: crewMembers, error: crewError } = await supabase
      .from('crew_members')
      .select(`
        *,
        crew:crew_id(*)
      `)
      .order('joined_at', { ascending: false });
      
    if (crewError) throw crewError;
    
    return crewMembers;
  } catch (error) {
    console.error("Error fetching user crews:", error);
    toast.error("Failed to load your crews");
    return [];
  }
}

export async function getCrewMembers(crewId: string) {
  try {
    const { data, error } = await supabase
      .from('crew_members')
      .select('*')
      .eq('crew_id', crewId);
      
    if (error) throw error;
    return data as CrewMember[];
  } catch (error) {
    console.error("Error fetching crew members:", error);
    toast.error("Failed to load crew members");
    return [];
  }
}

export async function getCrewSessions(crewId: string) {
  try {
    const { data, error } = await supabase
      .from('crew_sessions')
      .select(`
        *,
        session:session_id(*)
      `)
      .eq('crew_id', crewId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching crew sessions:", error);
    toast.error("Failed to load crew sessions");
    return [];
  }
}

export async function getUserCrewSessions() {
  try {
    const { data: userCrews } = await supabase
      .from('crew_members')
      .select('crew_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (!userCrews || userCrews.length === 0) {
      return [];
    }

    const crewIds = userCrews.map(c => c.crew_id);
    
    const { data, error } = await supabase
      .from('crew_sessions')
      .select(`
        *,
        session:session_id(*),
        crew:crew_id(name)
      `)
      .in('crew_id', crewIds)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user crew sessions:", error);
    toast.error("Failed to load your crew sessions");
    return [];
  }
}

export async function getUserAttendanceStatus(crewSessionId: string) {
  try {
    const { data, error } = await supabase
      .from('crew_session_attendance')
      .select('*')
      .eq('crew_session_id', crewSessionId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as CrewSessionAttendance;
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    toast.error("Failed to load attendance status");
    return null;
  }
}

export async function updateAttendanceStatus(crewSessionId: string, status: 'confirmed' | 'declined') {
  try {
    // Check if attendance record exists
    const { data: existingAttendance } = await supabase
      .from('crew_session_attendance')
      .select('*')
      .eq('crew_session_id', crewSessionId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();
    
    if (existingAttendance) {
      // Update existing attendance
      const { data, error } = await supabase
        .from('crew_session_attendance')
        .update({ status })
        .eq('id', existingAttendance.id)
        .select()
        .single();
        
      if (error) throw error;
      toast.success(`Session ${status === 'confirmed' ? 'confirmed' : 'declined'}`);
      return data as CrewSessionAttendance;
    } else {
      // Create new attendance record
      const { data, error } = await supabase
        .from('crew_session_attendance')
        .insert({ 
          crew_session_id: crewSessionId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status 
        })
        .select()
        .single();
        
      if (error) throw error;
      toast.success(`Session ${status === 'confirmed' ? 'confirmed' : 'declined'}`);
      return data as CrewSessionAttendance;
    }
  } catch (error) {
    console.error("Error updating attendance status:", error);
    toast.error("Failed to update attendance status");
    throw error;
  }
}

// Manual crew matching (for demo purposes)
export async function triggerCrewMatching() {
  try {
    const { data, error } = await supabase
      .rpc('match_user_to_crews');
      
    if (error) throw error;
    toast.success("Crew matching process triggered");
    return true;
  } catch (error) {
    console.error("Error triggering crew matching:", error);
    toast.error("Failed to trigger crew matching");
    return false;
  }
}

// Utility functions
export function getDayName(dayNum: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNum];
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatAvailabilityTime(availability: UserAvailability): string {
  return `${getDayName(availability.day_of_week)}, ${formatTime(availability.start_time)} - ${formatTime(availability.end_time)}`;
}
