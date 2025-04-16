"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CrewCard } from "@/components/crews/crew-card"
import { CrewSessionCard } from "@/components/crews/crew-session-card"
import { MatchingRequestForm } from "@/components/crews/matching-request-form"
import { getUserCrews, getUserCrewSessions } from "@/utils/crew-service"
import { createClient } from "@supabase/supabase-js"
import { Loader2, Users, Calendar, UserPlus } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CrewsPage() {
  const router = useRouter()
  const [crews, setCrews] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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

          // Fetch user's crews and sessions
          const [crewsData, sessionsData] = await Promise.all([getUserCrews(), getUserCrewSessions()])

          setCrews(crewsData)
          setSessions(sessionsData)
        } else {
          router.push("/login")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()
  }, [router])

  const handleSessionResponse = async () => {
    try {
      const sessionsData = await getUserCrewSessions()
      setSessions(sessionsData)
    } catch (err) {
      console.error("Error refreshing sessions:", err)
    }
  }

  const handleMatchingRequest = async () => {
    try {
      const crewsData = await getUserCrews()
      setCrews(crewsData)
    } catch (err) {
      console.error("Error refreshing crews:", err)
    }
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-navy mb-2">My Crews</h1>
          <p className="text-gray-600">View your crews and upcoming sessions</p>
        </div>

        <Tabs defaultValue="crews" className="space-y-6">
          <TabsList className="bg-white border border-sand">
            <TabsTrigger value="crews" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              My Crews
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Sessions
            </TabsTrigger>
            <TabsTrigger value="matching" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Find a Crew
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crews">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : crews.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-sand p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-navy mb-2">No Crews Yet</h3>
                <p className="text-gray-600 mb-6">
                  You're not part of any crews yet. Submit a matching request to find your perfect crew.
                </p>
                <Button
                  onClick={() => document.querySelector('[data-value="matching"]')?.click()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Find a Crew
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crews.map((crew) => (
                  <CrewCard key={crew.id} crew={crew} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-sand p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-navy mb-2">No Upcoming Sessions</h3>
                <p className="text-gray-600 mb-6">You don't have any upcoming crew sessions scheduled.</p>
                {crews.length > 0 && (
                  <Button
                    onClick={() => document.querySelector('[data-value="crews"]')?.click()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    View My Crews
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {sessions.map((session) => (
                    <CrewSessionCard key={session.id} session={session} onResponseSubmitted={handleSessionResponse} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="matching">
            <div className="max-w-2xl mx-auto">
              <MatchingRequestForm onRequestSubmitted={handleMatchingRequest} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  )
}

