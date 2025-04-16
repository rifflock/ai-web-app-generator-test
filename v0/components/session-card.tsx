"use client"

import { formatDate, formatTime } from "@/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import type { Session } from "@/utils/session-service"

interface SessionCardProps {
  session: Session
  isBooked?: boolean
  onBook?: () => void
  showDetails?: boolean
}

export function SessionCard({ session, isBooked, onBook, showDetails = false }: SessionCardProps) {
  const startTime = new Date(session.start_time)
  const endTime = new Date(session.end_time)

  return (
    <Card className="border-sand shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-sand-light border-b border-sand">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-navy">{session.title}</CardTitle>
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
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-gray-600">
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-gray-600">{session.location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Users className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-sm text-gray-600">{session.max_participants} participants</p>
            </div>
          </div>

          {showDetails && session.description && (
            <div className="mt-3">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-gray-600">{session.description}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-sand pt-4 flex justify-between items-center">
        <div className="font-semibold text-primary">${session.price.toFixed(2)}</div>
        {isBooked ? (
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">
            Booked
          </Badge>
        ) : showDetails ? (
          <Button onClick={onBook} className="bg-primary hover:bg-primary/90">
            Book Session
          </Button>
        ) : (
          <Link href={`/sessions/${session.id}`}>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

