import { createClient } from "@supabase/supabase-js"
import { getDatesBetween, combineDateAndTime } from "./date-utils"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Session {
  id: string
  title: string
  description: string
  session_type: "regular" | "special" | "workshop"
  start_time: string
  end_time: string
  location: string
  max_participants: number
  price: number
  created_at: string
  updated_at: string
}

export interface SessionSeries {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  day_of_week: number[]
  time_of_day: string
  duration_minutes: number
  location: string
  max_participants: number
  price_per_session: number
  total_sessions: number
  discount_percentage: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  session_id?: string
  series_id?: string
  status: "confirmed" | "cancelled" | "waitlisted"
  payment_status: "paid" | "pending" | "refunded"
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  booking_id: string
  session_id: string
  user_id: string
  status: "present" | "absent" | "late"
  check_in_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Session functions
export async function getSessions(future = true) {
  const query = supabase.from("sessions").select("*").order("start_time", { ascending: true })

  if (future) {
    query.gt("start_time", new Date().toISOString())
  }

  const { data, error } = await query

  if (error) throw error
  return data as Session[]
}

export async function getSessionById(id: string) {
  const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single()

  if (error) throw error
  return data as Session
}

export async function createSession(session: Omit<Session, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("sessions").insert([session]).select()

  if (error) throw error
  return data[0] as Session
}

export async function updateSession(id: string, updates: Partial<Session>) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) throw error
  return data[0] as Session
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id)

  if (error) throw error
  return true
}

// Session Series functions
export async function getSessionSeries() {
  const { data, error } = await supabase.from("session_series").select("*").order("start_date", { ascending: true })

  if (error) throw error
  return data as SessionSeries[]
}

export async function getSessionSeriesById(id: string) {
  const { data, error } = await supabase.from("session_series").select("*").eq("id", id).single()

  if (error) throw error
  return data as SessionSeries
}

export async function createSessionSeries(series: Omit<SessionSeries, "id" | "created_at" | "updated_at">) {
  // First create the series
  const { data, error } = await supabase.from("session_series").insert([series]).select()

  if (error) throw error
  const createdSeries = data[0] as SessionSeries

  // Then generate individual sessions for this series
  const startDate = new Date(series.start_date)
  const endDate = new Date(series.end_date)
  const sessionDates = getDatesBetween(startDate, endDate, series.day_of_week)

  // Create individual sessions for each date
  const sessionPromises = sessionDates.map((date) => {
    const startTime = combineDateAndTime(date, series.time_of_day)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + series.duration_minutes)

    return createSession({
      title: series.title,
      description: series.description,
      session_type: "regular",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: series.location,
      max_participants: series.max_participants,
      price: series.price_per_session,
    })
  })

  await Promise.all(sessionPromises)

  return createdSeries
}

// Booking functions
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      sessions:session_id (*),
      session_series:series_id (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("bookings").insert([booking]).select()

  if (error) throw error
  return data[0] as Booking
}

export async function updateBookingStatus(
  id: string,
  status: Booking["status"],
  paymentStatus?: Booking["payment_status"],
) {
  const updates: Partial<Booking> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (paymentStatus) {
    updates.payment_status = paymentStatus
  }

  const { data, error } = await supabase.from("bookings").update(updates).eq("id", id).select()

  if (error) throw error
  return data[0] as Booking
}

// Attendance functions
export async function recordAttendance(attendance: Omit<Attendance, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("attendance").insert([attendance]).select()

  if (error) throw error
  return data[0] as Attendance
}

export async function getSessionAttendance(sessionId: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      profiles:user_id (first_name, last_name)
    `)
    .eq("session_id", sessionId)

  if (error) throw error
  return data
}

export async function getUserAttendance(userId: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(`
      *,
      sessions:session_id (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

