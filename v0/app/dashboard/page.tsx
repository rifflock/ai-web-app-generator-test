"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Heart, MessageSquare, Settings, User, Users, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"
import { PageLayout } from "@/components/page-layout"
import { getUserBookings } from "@/utils/session-service"
import { getUserPayments, getUserDonations } from "@/utils/payment-service"
import { getUserCrews, getUserCrewSessions } from "@/utils/crew-service"
import { formatDateTime } from "@/utils/date-utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Profile = {
  id: string
  first_name: string
  last_name: string
  phone_number: string
}

type RowingExperience = {
  experience_level: string
  years_rowing: number
  preferred_position: string
}

type Availability = {
  weekday_mornings: boolean
  weekday_evenings: boolean
  weekend_mornings: boolean
  weekend_afternoons: boolean
}

type Preferences = {
  crew_size: string
  competitive_level: string
  additional_info: string
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experience, setExperience] = useState<RowingExperience | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [crews, setCrews] = useState<any[]>([])
  const [crewSessions, setCrewSessions] = useState<any[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        // Fetch rowing experience
        const { data: experienceData, error: experienceError } = await supabase
          .from("rowing_experience")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (experienceError && experienceError.code !== "PGRST116") {
          throw experienceError
        }

        // Fetch availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("availability")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (availabilityError && availabilityError.code !== "PGRST116") {
          throw availabilityError
        }

        // Fetch preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from("preferences")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (preferencesError && preferencesError.code !== "PGRST116") {
          throw preferencesError
        }

        // Fetch bookings, payments, donations, crews, and crew sessions
        const [bookingsData, paymentsData, donationsData, crewsData, crewSessionsData] = await Promise.all([
          getUserBookings(user.id),
          getUserPayments(user.id),
          getUserDonations(user.id),
          getUserCrews(),
          getUserCrewSessions(),
        ])

        setProfile(profileData)
        setExperience(experienceData)
        setAvailability(availabilityData)
        setPreferences(preferencesData)
        setBookings(bookingsData)
        setPayments(paymentsData)
        setDonations(donationsData)
        setCrews(crewsData)
        setCrewSessions(crewSessionsData)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Confirmed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Cancelled
          </Badge>
        )
      case "waitlisted":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Waitlisted
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Failed
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            {status}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-light">
        <div className="text-center">
          <Waves className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout user={profile} onSignOut={handleSignOut}>
      <div className="container mx-auto flex flex-1 gap-8 px-4 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="bg-white rounded-lg shadow-sm border border-sand p-4">
            <nav className="flex flex-col space-y-1">
              <Button variant="ghost" className="justify-start text-primary" asChild>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Crews</span>
                </div>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/crews" className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Crews</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/sessions" className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Sessions</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/messages" className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/donate" className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Donate</span>
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
              </Button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-sand p-6 mb-6">
            <h2 className="text-2xl font-display font-bold text-navy">Welcome, {profile?.first_name || "Rower"}</h2>
            <p className="text-gray-600">Manage your rowing profile and find your perfect crew match</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card className="border-sand shadow-sm">
              <CardHeader className="bg-sand-light border-b border-sand p-4">
                <CardTitle className="text-navy text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  My Crews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-navy">{crews.length}</div>
                <p className="text-sm text-gray-600">Active crews</p>
              </CardContent>
              <div className="p-4 border-t border-sand">
                <Button variant="link" className="p-0 h-auto text-primary" asChild>
                  <Link href="/crews">View all crews</Link>
                </Button>
              </div>
            </Card>

            <Card className="border-sand shadow-sm">
              <CardHeader className="bg-sand-light border-b border-sand p-4">
                <CardTitle className="text-navy text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-navy">{crewSessions.length}</div>
                <p className="text-sm text-gray-600">Scheduled sessions</p>
              </CardContent>
              <div className="p-4 border-t border-sand">
                <Button variant="link" className="p-0 h-auto text-primary" asChild>
                  <Link href="/crews?tab=sessions">View all sessions</Link>
                </Button>
              </div>
            </Card>

            <Card className="border-sand shadow-sm">
              <CardHeader className="bg-sand-light border-b border-sand p-4">
                <CardTitle className="text-navy text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-navy">0</div>
                <p className="text-sm text-gray-600">Unread messages</p>
              </CardContent>
              <div className="p-4 border-t border-sand">
                <Button variant="link" className="p-0 h-auto text-primary" asChild>
                  <Link href="/messages">View messages</Link>
                </Button>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="crews" className="space-y-6">
            <TabsList className="bg-white border border-sand">
              <TabsTrigger value="crews" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Crews
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="crews">
              <Card className="border-sand shadow-sm">
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    My Crews
                  </CardTitle>
                  <CardDescription>Your active rowing crews</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {crews.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-secondary opacity-50" />
                      <p className="text-gray-500 mt-4">You're not part of any crews yet.</p>
                      <Button
                        className="mt-4 bg-primary hover:bg-primary/90"
                        onClick={() => router.push("/crews?tab=matching")}
                      >
                        Find a Crew
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {crews.slice(0, 2).map((crew) => (
                          <div key={crew.id} className="bg-sand-light p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-navy">{crew.name}</h3>
                                <p className="text-sm text-gray-600">Position: {crew.membership.position}</p>
                              </div>
                              <Badge>{crew.type}</Badge>
                            </div>
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full border-primary text-primary hover:bg-primary/10"
                                asChild
                              >
                                <Link href={`/crews/${crew.id}`}>View Crew</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {crews.length > 2 && (
                        <div className="flex justify-center">
                          <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push("/crews")}>
                            View All Crews
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card className="border-sand shadow-sm">
                <CardHeader className="bg-sand-light border-b border-sand">
                  <CardTitle className="text-navy flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription>Your scheduled rowing sessions</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {crewSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-secondary opacity-50" />
                      <p className="text-gray-500 mt-4">You don't have any upcoming sessions.</p>
                      {crews.length > 0 ? (
                        <Button
                          className="mt-4 bg-primary hover:bg-primary/90"
                          onClick={() => router.push("/crews?tab=sessions")}
                        >
                          View Sessions
                        </Button>
                      ) : (
                        <Button
                          className="mt-4 bg-primary hover:bg-primary/90"
                          onClick={() => router.push("/crews?tab=matching")}
                        >
                          Find a Crew
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-sand">
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Session</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Date & Time</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Crew</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {crewSessions.slice(0, 3).map((session) => (
                              <tr key={session.id} className="border-b border-sand">
                                <td className="py-3 px-4">
                                  <div className="font-medium">{session.title}</div>
                                  <div className="text-sm text-gray-500">{session.location}</div>
                                </td>
                                <td className="py-3 px-4">{formatDateTime(session.start_time)}</td>
                                <td className="py-3 px-4">{session.crew?.name || "Unknown"}</td>
                                <td className="py-3 px-4">
                                  {session.confirmation ? (
                                    getStatusBadge(session.confirmation.status)
                                  ) : (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                      Awaiting Response
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary text-primary hover:bg-primary/10"
                                    onClick={() => router.push(`/crews/${session.crew_id}`)}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {crewSessions.length > 3 && (
                        <div className="flex justify-center">
                          <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => router.push("/crews?tab=sessions")}
                          >
                            View All Sessions
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-sand shadow-sm">
                  <CardHeader className="bg-sand-light border-b border-sand">
                    <CardTitle className="text-navy">Personal Information</CardTitle>
                    <CardDescription>Your basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="font-medium text-navy">
                          {profile?.first_name} {profile?.last_name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="font-medium text-navy">{profile?.phone_number || "Not provided"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card className="border-sand shadow-sm">
                  <CardHeader className="bg-sand-light border-b border-sand">
                    <CardTitle className="text-navy">Rowing Experience</CardTitle>
                    <CardDescription>Your rowing background</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
                        <dd className="capitalize font-medium text-navy">
                          {experience?.experience_level || "Not provided"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Years Rowing</dt>
                        <dd className="font-medium text-navy">{experience?.years_rowing || "Not provided"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Preferred Position</dt>
                        <dd className="capitalize font-medium text-navy">
                          {experience?.preferred_position || "Not provided"}
                        </dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageLayout>
  )
}

