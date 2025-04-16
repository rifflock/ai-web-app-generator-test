"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatSessionTime, respondToCrewSession, type CrewSession } from "@/utils/crew-service"
import { Calendar, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface CrewSessionCardProps {
  session: CrewSession
  onResponseSubmitted?: () => void
}

export function CrewSessionCard({ session, onResponseSubmitted }: CrewSessionCardProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await respondToCrewSession(session.id, "confirmed", notes)
      setIsConfirmDialogOpen(false)
      if (onResponseSubmitted) onResponseSubmitted()
    } catch (error) {
      console.error("Error confirming session:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDecline = async () => {
    setIsSubmitting(true)
    try {
      await respondToCrewSession(session.id, "declined", notes)
      setIsDeclineDialogOpen(false)
      if (onResponseSubmitted) onResponseSubmitted()
    } catch (error) {
      console.error("Error declining session:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    if (!session.confirmation) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          Awaiting Response
        </Badge>
      )
    }

    switch (session.confirmation.status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Confirmed
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Declined
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Pending
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card className="border-sand shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-sand-light border-b border-sand">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-navy">{session.title}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {formatSessionTime(session)}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 text-primary" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600">{session.location}</p>
              </div>
            </div>

            {session.description && (
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-600">{session.description}</p>
              </div>
            )}

            {session.crew && (
              <div className="bg-sand-light p-3 rounded-md">
                <p className="text-sm font-medium">Crew</p>
                <p className="text-sm text-gray-600">{session.crew.name}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-sand pt-4 flex justify-between">
          {!session.confirmation || session.confirmation.status === "pending" ? (
            <>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setIsDeclineDialogOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsConfirmDialogOpen(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </>
          ) : session.confirmation.status === "confirmed" ? (
            <Button
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => setIsDeclineDialogOpen(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Attendance
            </Button>
          ) : (
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setIsConfirmDialogOpen(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Attendance
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Attendance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm your attendance for this session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Add any notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-sand focus:border-primary focus:ring-primary"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirm()
              }}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this session? Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for declining (required)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-sand focus:border-primary focus:ring-primary"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDecline()
              }}
              disabled={isSubmitting || !notes.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

