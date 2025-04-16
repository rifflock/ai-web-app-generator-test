"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SessionCard } from "@/components/session-card"
import { SessionSeriesCard } from "@/components/session-series-card"
import {
  getSessions,
  getSessionSeries,
  getUserBookings,
  type Session,
  type SessionSeries,
} from "@/utils/session-service"
import { createClient } from "@supabase/supabase-js"
import { Calendar, Search } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [seriesList, setSeriesList] = useState<SessionSeries[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sessionType, setSessionType] = useState<string>("all")
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)

          // Fetch user's bookings
          const bookings = await getUserBookings(user.id)
          setUserBookings(bookings)
        }

        // Fetch sessions and series
        const [sessionsData, seriesData] = await Promise.all([getSessions(), getSessionSeries()])

        setSessions(sessionsData)
        setSeriesList(seriesData)
      } catch (err: any) {
        setError(err.message || "Failed to load sessions")
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()
  }, [])

  const isSessionBooked = (sessionId: string) => {
    return userBookings.some((booking) => booking.session_id === sessionId && booking.status !== "cancelled")
  }

  const isSeriesBooked = (seriesId: string) => {
    return userBookings.some((booking) => booking.series_id === seriesId && booking.status !== "cancelled")
  }

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = searchTerm
      ? session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    const matchesType = sessionType === "all" ? true : session.session_type === sessionType

    return matchesSearch && matchesType
  })

  const filteredSeries = seriesList.filter((series) => {
    const matchesSearch = searchTerm
      ? series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        series.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true

    return matchesSearch
  })

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-navy mb-2">Rowing Sessions</h1>
          <p className="text-gray-600">Browse and book available rowing sessions and series</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-sand p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-sand focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger className="border-sand focus:ring-primary">
                  <SelectValue placeholder="Session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-white border border-sand">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Upcoming Sessions
            </TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Session Series
            </TabsTrigger>
            {userId && (
              <TabsTrigger value="booked" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                My Bookings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="upcoming">
            {loading ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <p className="mt-4 text-gray-500">Loading sessions...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-sand">
                <p className="text-gray-500">No sessions found matching your criteria.</p>
                {searchTerm && (
                  <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary mt-2">
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isBooked={userId ? isSessionBooked(session.id) : false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="series">
            {loading ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <p className="mt-4 text-gray-500">Loading session series...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
            ) : filteredSeries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-sand">
                <p className="text-gray-500">No session series found matching your criteria.</p>
                {searchTerm && (
                  <Button variant="link" onClick={() => setSearchTerm("")} className="text-primary mt-2">
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredSeries.map((series) => (
                  <SessionSeriesCard
                    key={series.id}
                    series={series}
                    isBooked={userId ? isSeriesBooked(series.id) : false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {userId && (
            <TabsContent value="booked">
              {loading ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-primary animate-pulse" />
                  <p className="mt-4 text-gray-500">Loading your bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-sand">
                  <p className="text-gray-500">You haven't booked any sessions yet.</p>
                  <Button variant="link" onClick={() => router.push("/sessions")} className="text-primary mt-2">
                    Browse available sessions
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-navy">Individual Sessions</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBookings
                      .filter((booking) => booking.session_id && booking.status !== "cancelled")
                      .map((booking) => (
                        <SessionCard key={booking.id} session={booking.sessions} isBooked={true} />
                      ))}
                  </div>

                  <h3 className="text-xl font-semibold text-navy mt-8">Session Series</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {userBookings
                      .filter((booking) => booking.series_id && booking.status !== "cancelled")
                      .map((booking) => (
                        <SessionSeriesCard key={booking.id} series={booking.session_series} isBooked={true} />
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  )
}

