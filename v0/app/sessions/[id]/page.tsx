"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSessionById, createBooking, getUserBookings, type Session } from "@/utils/session-service"
import { PaymentForm } from "@/components/payment-form"
import { AttendanceTracker } from "@/components/attendance-tracker"
import { formatDate, formatTime } from "@/utils/date-utils"
import { createClient } from "@supabase/supabase-js"
import { Calendar, Clock, MapPin, Users, ArrowLeft, AlertCircle } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isBooked, setIsBooked] = useState<boolean>(false)
  const [showPayment, setShowPayment] = useState<boolean>(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)

          // Check if user is admin
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

          if (profile && profile.role === "admin") {
            setIsAdmin(true)
          }

          // Check if user has already booked this session
          const bookings = await getUserBookings(user.id)
          const booking = bookings.find((b) => b.session_id === params.id && b.status !== "cancelled")

          if (booking) {
            setIsBooked(true)
            setBookingId(booking.id)
          }
        }

        // Fetch session details
        const sessionData = await getSessionById(params.id)
        setSession(sessionData)
      } catch (err: any) {
        setError(err.message || "Failed to load session details")
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndUser()
  }, [params.id])

  const handleBookSession = async () => {
    if (!userId) {
      router.push("/login")
      return
    }

    if (!session) return

    try {
      // Create a booking with pending payment status
      const booking = await createBooking({
        user_id: userId,
        session_id: session.id,
        status: "confirmed",
        payment_status: "pending",
      })

      setBookingId(booking.id)
      setShowPayment(true)
    } catch (err: any) {
      setError(err.message || "Failed to book session")
    }
  }

  const handlePaymentSuccess = () => {
    setIsBooked(true)
    setShowPayment(false)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <p className="mt-4 text-gray-500">Loading session details...</p>
        </div>
      </PageLayout>
    )
  }

  if (error || !session) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error || "Session not found"}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/sessions")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </PageLayout>
    )
  }

  const startTime = new Date(session.start_time)
  const endTime = new Date(session.end_time)

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.push("/sessions")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="border-sand shadow-sm">
              <CardHeader className="bg-sand-light border-b border-sand">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-navy">{session.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(startTime)}
                    </CardDescription>
                  </div>
                  <Badge variant={session.session_type === "special" ? "secondary" : "default"}>
                    {session.session_type === "regular"
                      ? "Regular"
                      : session.session_type === "special"
                        ? "Special"
                        : "Workshop"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 mt-1 text-primary" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-gray-600">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-3 mt-1 text-primary" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">{session.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 mt-1 text-primary" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-gray-600">{session.max_participants} participants</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 mt-1 text-primary" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">
                          {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  {session.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">Description</h3>
                      <p className="text-gray-600">{session.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isAdmin && (
              <div className="mt-8">
                <AttendanceTracker sessionId={session.id} sessionDate={session.start_time} isAdmin={true} />
              </div>
            )}
          </div>

          <div>
            {showPayment ? (
              <PaymentForm
                amount={session.price}
                paymentType="session"
                description={`Session: ${session.title} on ${formatDate(startTime)}`}
                userId={userId!}
                bookingId={bookingId!}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            ) : (
              <Card className="border-sand shadow-sm">
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy">Session Booking</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="bg-sand-light p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Price:</span>
                        <span className="font-bold text-primary">${session.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-primary/10 p-4 rounded-md">
                      <h4 className="font-medium mb-2">What's included:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-primary mr-2">✓</span>
                          <span>Professional coaching</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-primary mr-2">✓</span>
                          <span>Equipment usage</span>
                        </li>
                        <li className="flex items-start">
                          <span className="h-5 w-5 text-primary mr-2">✓</span>
                          <span>Safety briefing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-sand pt-4">
                  {isBooked ? (
                    <Button disabled className="w-full bg-secondary">
                      Already Booked
                    </Button>
                  ) : (
                    <Button onClick={handleBookSession} className="w-full bg-primary hover:bg-primary/90">
                      Book Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

