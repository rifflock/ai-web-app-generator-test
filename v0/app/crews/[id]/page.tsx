"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CrewSessionCard } from "@/components/crews/crew-session-card"
import { getCrew, getCrewSessions, getCrewTypeLabel, getSkillLevelLabel, getPositionLabel } from "@/utils/crew-service"
import { createClient } from "@supabase/supabase-js"
import { ArrowLeft, Users, Calendar, User, Loader2 } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CrewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [crew, setCrew] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCrewAndSessions = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserId(user.id)

          // Fetch crew and sessions
          const [crewData, sessionsData] = await Promise.all([getCrew(params.id), getCrewSessions(params.id)])

          setCrew(crewData)
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

    fetchCrewAndSessions()
  }, [params.id, router])

  const handleSessionResponse = async () => {
    try {
      const sessionsData = await getCrewSessions(params.id)
      setSessions(sessionsData)
    } catch (err) {
      console.error("Error refreshing sessions:", err)
    }
  }

  const getUserMembership = () => {
    if (!crew || !userId) return null
    return crew.members.find((m: any) => m.user_id === userId)
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!crew) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => router.push("/crews")} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Crews
          </Button>
          <div className="bg-white rounded-lg shadow-sm border border-sand p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-navy mb-2">Crew Not Found</h3>
            <p className="text-gray-600 mb-6">
              The crew you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const userMembership = getUserMembership()

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => router.push("/crews")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Crews
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="border-sand shadow-sm sticky top-24">
              <CardHeader className="bg-sand-light border-b border-sand">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-navy">{crew.name}</CardTitle>
                  <Badge variant="default">{getCrewTypeLabel(crew.type)}</Badge>
                </div>
                <CardDescription className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-1" />
                  {crew.members.length} {crew.members.length === 1 ? "member" : "members"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Skill Level</p>
                    <p className="text-sm text-gray-600">{getSkillLevelLabel(crew.skill_level)}</p>
                  </div>

                  {crew.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-gray-600">{crew.description}</p>
                    </div>
                  )}

                  {userMembership && (
                    <div className="bg-sand-light p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Your Position</p>
                          <p className="text-sm text-gray-600">{getPositionLabel(userMembership.position)}</p>
                        </div>
                      </div>
                      {userMembership.is_captain && (
                        <div className="mt-2">
                          <Badge variant="secondary">Captain</Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="members" className="space-y-6">
              <TabsList className="bg-white border border-sand">
                <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members">
                <Card className="border-sand shadow-sm">
                  <CardHeader className="bg-sand-light border-b border-sand">
                    <CardTitle className="text-navy">Crew Members</CardTitle>
                    <CardDescription>All members of this crew</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {crew.members.map((member: any) => (
                        <div key={member.id} className="flex items-center p-3 border border-sand rounded-md">
                          <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-navy">
                              {member.profiles.first_name} {member.profiles.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{getPositionLabel(member.position)}</p>
                          </div>
                          <div>{member.is_captain && <Badge variant="secondary">Captain</Badge>}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions">
                {sessions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-sand p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-navy mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-600 mb-6">This crew doesn't have any upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sessions.map((session) => (
                      <CrewSessionCard key={session.id} session={session} onResponseSubmitted={handleSessionResponse} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

