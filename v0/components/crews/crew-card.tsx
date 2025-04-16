"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/date-utils"
import { getCrewTypeLabel, getSkillLevelLabel, type Crew } from "@/utils/crew-service"
import Link from "next/link"
import { Users } from "lucide-react"

interface CrewCardProps {
  crew: Crew & {
    membership?: {
      position: string
      is_captain: boolean
      joined_at: string
    }
  }
  showActions?: boolean
}

export function CrewCard({ crew, showActions = true }: CrewCardProps) {
  const memberCount = crew.members?.length || 0
  const joinDate = crew.membership ? new Date(crew.membership.joined_at) : null

  return (
    <Card className="border-sand shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-sand-light border-b border-sand">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-navy">{crew.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Users className="h-4 w-4 mr-1" />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </CardDescription>
          </div>
          <Badge variant={crew.is_active ? "default" : "outline"}>{getCrewTypeLabel(crew.type)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
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

          {crew.membership && (
            <div className="bg-sand-light p-3 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Your Position</p>
                  <p className="text-sm text-gray-600">{crew.membership.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-gray-600">{joinDate ? formatDate(joinDate) : "Unknown"}</p>
                </div>
              </div>
              {crew.membership.is_captain && (
                <div className="mt-2">
                  <Badge variant="secondary">Captain</Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="border-t border-sand pt-4">
          <Link href={`/crews/${crew.id}`} className="w-full">
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
              View Crew
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}

