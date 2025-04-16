import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PaymentMethod = "credit_card" | "bank_transfer" | "cash"
export type PaymentType = "session" | "subscription" | "donation"
export type PaymentStatus = "completed" | "pending" | "failed" | "refunded"

export interface PaymentDetails {
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  description: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  receiptUrl?: string
  status: PaymentStatus
  message?: string
  error?: any
}

export interface Payment {
  id: string
  user_id: string
  booking_id?: string
  amount: number
  payment_type: "session" | "subscription" | "donation"
  payment_method: "credit_card" | "bank_transfer" | "cash"
  status: "completed" | "pending" | "failed" | "refunded"
  transaction_id?: string
  receipt_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  user_id: string
  payment_id: string
  amount: number
  campaign?: string
  is_anonymous: boolean
  message?: string
  created_at: string
}

// Mock payment processing
export async function processPayment(details: PaymentDetails): Promise<PaymentResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate success (95% of the time)
  const isSuccess = Math.random() < 0.95

  if (isSuccess) {
    return {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      receiptUrl: `https://receipts.example.com/${Math.random().toString(36).substring(2, 10)}`,
      status: "completed",
      message: "Payment processed successfully",
    }
  } else {
    return {
      success: false,
      status: "failed",
      message: "Payment processing failed",
      error: "Card declined",
    }
  }
}

export async function createRefund(transactionId: string): Promise<PaymentResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    transactionId: `ref_${Math.random().toString(36).substring(2, 10)}`,
    status: "refunded",
    message: "Refund processed successfully",
  }
}

// Database interaction functions
export async function createPayment(payment: Omit<Payment, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("payments").insert([payment]).select()

  if (error) throw error
  return data[0] as Payment
}

export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Payment[]
}

export async function createDonation(donation: Omit<Donation, "id" | "created_at">) {
  const { data, error } = await supabase.from("donations").insert([donation]).select()

  if (error) throw error
  return data[0] as Donation
}

export async function getUserDonations(userId: string) {
  const { data, error } = await supabase
    .from("donations")
    .select("*, payments!payment_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getAllDonations(includeAnonymous = false) {
  let query = supabase
    .from("donations")
    .select("*, profiles!user_id(first_name, last_name), payments!payment_id(*)")
    .order("created_at", { ascending: false })

  if (!includeAnonymous) {
    query = query.eq("is_anonymous", false)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

