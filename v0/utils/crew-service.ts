import { createClient } from "@supabase/supabase-js"
import { formatDate, formatTime } from "./date-utils"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Crew {
  id: string
  name: string
  type: string
  skill_level: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  members?: CrewMembership[]
}

export interface CrewMembership {
  id: string
  crew_id: string
  user_id: string
  position: string
  is_captain: boolean
  joined_at: string
  left_at: string | null
  profiles?: {
    first_name: string
    last_name: string
  }
}

export interface CrewSession {
  id: string
  crew_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  location: string
  is_recurring: boolean
  recurrence_pattern: string | null
  created_at: string
  updated_at: string
  crew?: Crew
  confirmation?: CrewConfirmation
}

export interface CrewConfirmation {
  id: string
  crew_session_id: string
  user_id: string
  status: "confirmed" | "declined" | "pending"
  response_time: string
  notes: string | null
}

export interface CrewMatchingRequest {
  id: string
  user_id: string
  preferred_crew_type: string
  preferred_skill_level: string
  preferred_position: string | null
  preferred_days: number[]
  preferred_time_start: string | null
  preferred_time_end: string | null
  is_flexible: boolean
  notes: string | null
  status: "pending" | "matched" | "cancelled"
  created_at: string
  updated_at: string
}

// Get all crews for the current user
export async function getUserCrews() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("crew_memberships")
    .select(`
      *,
      crews:crew_id(*)
    `)
    .eq("user_id", user.user.id)
    .is("left_at", null)

  if (error) throw error

  // Transform the data to return the crews with membership info
  return data.map((membership) => ({
    ...membership.crews,
    membership: {
      id: membership.id,
      position: membership.position,
      is_captain: membership.is_captain,
      joined_at: membership.joined_at,
    },
  }))
}

// Get a single crew by ID with all members
export async function getCrew(crewId: string) {
  const { data, error } = await supabase
    .from("crews")
    .select(`
      *,
      members:crew_memberships(
        *,
        profiles:user_id(first_name, last_name)
      )
    `)
    .eq("id", crewId)
    .is("crew_memberships.left_at", null)
    .single()

  if (error) throw error
  return data
}

// Get upcoming sessions for a crew
export async function getCrewSessions(crewId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("crew_sessions")
    .select(`
      *,
      confirmations:crew_confirmations(*)
    `)
    .eq("crew_id", crewId)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  if (error) throw error

  // Filter confirmations to only include the current user's
  return data.map((session) => ({
    ...session,
    confirmation: session.confirmations.find((c: any) => c.user_id === user.user?.id) || null,
  }))
}

// Get all upcoming sessions for the current user across all crews
export async function getUserCrewSessions() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("crew_sessions")
    .select(`
      *,
      crew:crew_id(*),
      confirmations:crew_confirmations(*)
    `)
    .in("crew_id", supabase.from("crew_memberships").select("crew_id").eq("user_id", user.user.id).is("left_at", null))
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })

  if (error) throw error

  // Filter confirmations to only include the current user's
  return data.map((session) => ({
    ...session,
    confirmation: session.confirmations.find((c: any) => c.user_id === user.user?.id) || null,
  }))
}

// Confirm or decline a crew session
export async function respondToCrewSession(sessionId: string, status: "confirmed" | "declined", notes?: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  // Check if a confirmation already exists
  const { data: existingConfirmation, error: checkError } = await supabase
    .from("crew_confirmations")
    .select("*")
    .eq("crew_session_id", sessionId)
    .eq("user_id", user.user.id)
    .maybeSingle()

  if (checkError) throw checkError

  if (existingConfirmation) {
    // Update existing confirmation
    const { data, error } = await supabase
      .from("crew_confirmations")
      .update({
        status,
        notes,
        response_time: new Date().toISOString(),
      })
      .eq("id", existingConfirmation.id)
      .select()

    if (error) throw error
    return data[0]
  } else {
    // Create new confirmation
    const { data, error } = await supabase
      .from("crew_confirmations")
      .insert({
        crew_session_id: sessionId,
        user_id: user.user.id,
        status,
        notes,
      })
      .select()

    if (error) throw error
    return data[0]
  }
}

// Create a crew matching request
export async function createMatchingRequest(
  request: Omit<CrewMatchingRequest, "id" | "user_id" | "status" | "created_at" | "updated_at">,
) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  // Check if user already has a pending request
  const { data: existingRequest, error: checkError } = await supabase
    .from("crew_matching_requests")
    .select("*")
    .eq("user_id", user.user.id)
    .eq("status", "pending")
    .maybeSingle()

  if (checkError) throw checkError

  if (existingRequest) {
    // Update existing request
    const { data, error } = await supabase
      .from("crew_matching_requests")
      .update({
        ...request,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRequest.id)
      .select()

    if (error) throw error
    return data[0]
  } else {
    // Create new request
    const { data, error } = await supabase
      .from("crew_matching_requests")
      .insert({
        ...request,
        user_id: user.user.id,
        status: "pending",
      })
      .select()

    if (error) throw error
    return data[0]
  }
}

// Get the current user's matching request
export async function getUserMatchingRequest() {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("crew_matching_requests")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// Cancel a matching request
export async function cancelMatchingRequest(requestId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("crew_matching_requests")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("user_id", user.user.id)
    .select()

  if (error) throw error
  return data[0]
}

// Run the crew matching algorithm (admin only)
export async function runCrewMatching() {
  const { data, error } = await supabase.rpc("match_crews")

  if (error) throw error
  return data
}

// Helper functions
export function getCrewTypeLabel(type: string): string {
  switch (type) {
    case "1x":
      return "Single Scull"
    case "2x":
      return "Double Scull"
    case "4x":
      return "Quad Scull"
    case "8+":
      return "Eight"
    default:
      return type
  }
}

export function getSkillLevelLabel(level: string): string {
  switch (level) {
    case "beginner":
      return "Beginner"
    case "intermediate":
      return "Intermediate"
    case "advanced":
      return "Advanced"
    case "elite":
      return "Elite"
    default:
      return level
  }
}

export function getPositionLabel(position: string): string {
  switch (position) {
    case "bow":
      return "Bow"
    case "2":
      return "2"
    case "3":
      return "3"
    case "4":
      return "4"
    case "5":
      return "5"
    case "6":
      return "6"
    case "7":
      return "7"
    case "stroke":
      return "Stroke"
    case "cox":
      return "Cox"
    case "single":
      return "Single"
    default:
      return position
  }
}

export function formatSessionTime(session: CrewSession): string {
  const start = new Date(session.start_time)
  const end = new Date(session.end_time)

  return `${formatDate(start)} • ${formatTime(start)} - ${formatTime(end)}`
}

