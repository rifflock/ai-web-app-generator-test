"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TimePickerInput } from "@/components/ui/time-picker"
import {
  createMatchingRequest,
  getUserMatchingRequest,
  cancelMatchingRequest,
  type CrewMatchingRequest,
} from "@/utils/crew-service"
import { Loader2, AlertCircle } from "lucide-react"

interface MatchingRequestFormProps {
  onRequestSubmitted?: () => void
}

export function MatchingRequestForm({ onRequestSubmitted }: MatchingRequestFormProps) {
  const [existingRequest, setExistingRequest] = useState<CrewMatchingRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [crewType, setCrewType] = useState("8+")
  const [skillLevel, setSkillLevel] = useState("intermediate")
  const [position, setPosition] = useState("")
  const [days, setDays] = useState<number[]>([1, 3, 5]) // Mon, Wed, Fri
  const [timeStart, setTimeStart] = useState("06:00")
  const [timeEnd, setTimeEnd] = useState("08:00")
  const [isFlexible, setIsFlexible] = useState(true)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    const fetchExistingRequest = async () => {
      try {
        const request = await getUserMatchingRequest()
        setExistingRequest(request)

        // If there's an existing pending request, populate the form
        if (request && request.status === "pending") {
          setCrewType(request.preferred_crew_type)
          setSkillLevel(request.preferred_skill_level)
          setPosition(request.preferred_position || "")
          setDays(request.preferred_days)
          setTimeStart(request.preferred_time_start || "06:00")
          setTimeEnd(request.preferred_time_end || "08:00")
          setIsFlexible(request.is_flexible)
          setNotes(request.notes || "")
        }
      } catch (err) {
        console.error("Error fetching matching request:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchExistingRequest()
  }, [])

  const handleDayToggle = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleSubmit = async () => {
    if (days.length === 0) {
      setError("Please select at least one day of availability")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createMatchingRequest({
        preferred_crew_type: crewType,
        preferred_skill_level: skillLevel,
        preferred_position: position || null,
        preferred_days: days,
        preferred_time_start: timeStart,
        preferred_time_end: timeEnd,
        is_flexible: isFlexible,
        notes: notes || null,
      })

      if (onRequestSubmitted) onRequestSubmitted()
    } catch (err: any) {
      setError(err.message || "Failed to submit matching request")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!existingRequest) return

    setSubmitting(true)
    try {
      await cancelMatchingRequest(existingRequest.id)
      setExistingRequest(null)
      if (onRequestSubmitted) onRequestSubmitted()
    } catch (err: any) {
      setError(err.message || "Failed to cancel matching request")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-sand shadow-sm">
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    )
  }

  // If there's a matched or cancelled request, show a different UI
  if (existingRequest && existingRequest.status !== "pending") {
    return (
      <Card className="border-sand shadow-sm">
        <CardHeader className="bg-sand-light border-b border-sand">
          <CardTitle className="text-navy">Crew Matching Request</CardTitle>
          <CardDescription>
            {existingRequest.status === "matched"
              ? "You've been matched with a crew!"
              : "Your previous request was cancelled"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            {existingRequest.status === "matched" ? (
              <p className="text-green-600">
                Your request has been matched! Check your crews to see your new assignment.
              </p>
            ) : (
              <p className="text-gray-600">
                Your previous matching request was cancelled. You can submit a new request below.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t border-sand pt-4">
          <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit New Request"
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-sand shadow-sm">
      <CardHeader className="bg-sand-light border-b border-sand">
        <CardTitle className="text-navy">Crew Matching Request</CardTitle>
        <CardDescription>
          {existingRequest ? "Your current matching request" : "Find the perfect crew based on your preferences"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="crewType">Preferred Crew Type</Label>
          <Select value={crewType} onValueChange={setCrewType}>
            <SelectTrigger id="crewType" className="border-sand focus:ring-primary">
              <SelectValue placeholder="Select crew type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1x">Single Scull (1x)</SelectItem>
              <SelectItem value="2x">Double Scull (2x)</SelectItem>
              <SelectItem value="4x">Quad Scull (4x)</SelectItem>
              <SelectItem value="8+">Eight (8+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skillLevel">Skill Level</Label>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger id="skillLevel" className="border-sand focus:ring-primary">
              <SelectValue placeholder="Select skill level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Preferred Position (Optional)</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger id="position" className="border-sand focus:ring-primary">
              <SelectValue placeholder="Any position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any position</SelectItem>
              {crewType === "1x" ? (
                <SelectItem value="single">Single</SelectItem>
              ) : crewType === "2x" ? (
                <>
                  <SelectItem value="bow">Bow</SelectItem>
                  <SelectItem value="stroke">Stroke</SelectItem>
                </>
              ) : crewType === "4x" ? (
                <>
                  <SelectItem value="bow">Bow</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="stroke">Stroke</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="bow">Bow</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="stroke">Stroke</SelectItem>
                  <SelectItem value="cox">Cox</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Availability</Label>
          <div className="grid grid-cols-7 gap-2">
            {[
              { day: 0, label: "Sun" },
              { day: 1, label: "Mon" },
              { day: 2, label: "Tue" },
              { day: 3, label: "Wed" },
              { day: 4, label: "Thu" },
              { day: 5, label: "Fri" },
              { day: 6, label: "Sat" },
            ].map(({ day, label }) => (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer border ${
                  days.includes(day) ? "bg-primary/10 border-primary" : "border-sand hover:border-primary/50"
                }`}
                onClick={() => handleDayToggle(day)}
              >
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeStart">Preferred Start Time</Label>
            <TimePickerInput
              value={timeStart}
              onChange={setTimeStart}
              className="border-sand focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeEnd">Preferred End Time</Label>
            <TimePickerInput
              value={timeEnd}
              onChange={setTimeEnd}
              className="border-sand focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="flexible" checked={isFlexible} onCheckedChange={(checked) => setIsFlexible(checked === true)} />
          <Label htmlFor="flexible" className="cursor-pointer">
            I'm flexible with my schedule
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional preferences or information"
            className="border-sand focus:border-primary focus:ring-primary"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-sand pt-4 flex justify-between">
        {existingRequest ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Request"
              )}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary hover:bg-primary/90">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

