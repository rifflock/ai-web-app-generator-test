"use client"

import { formatDate } from "@/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users, Repeat } from "lucide-react"
import Link from "next/link"
import type { SessionSeries } from "@/utils/session-service"
import { getDayOfWeekName } from "@/utils/date-utils"

interface SessionSeriesCardProps {
  series: SessionSeries
  isBooked?: boolean
  onBook?: () => void
  showDetails?: boolean
}

export function SessionSeriesCard({ series, isBooked, onBook, showDetails = false }: SessionSeriesCardProps) {
  const startDate = new Date(series.start_date)
  const endDate = new Date(series.end_date)

  // Calculate total price with discount
  const totalPrice = series.price_per_session * series.total_sessions
  const discountAmount = totalPrice * (series.discount_percentage / 100)
  const finalPrice = totalPrice - discountAmount

  return (
    <Card className="border-sand shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-sand-light border-b border-sand">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-navy">{series.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </CardDescription>
          </div>
          <Badge variant="secondary">Series</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <Repeat className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Schedule</p>
              <p className="text-sm text-gray-600">
                {series.day_of_week.map((day) => getDayOfWeekName(day)).join(", ")} at{" "}
                {series.time_of_day.substring(0, 5)}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-sm text-gray-600">{series.duration_minutes} minutes</p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-gray-600">{series.location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Users className="h-4 w-4 mr-2 mt-1 text-primary" />
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-sm text-gray-600">{series.max_participants} participants</p>
            </div>
          </div>

          {showDetails && series.description && (
            <div className="mt-3">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-gray-600">{series.description}</p>
            </div>
          )}

          <div className="bg-sand-light p-3 rounded-md mt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Total Sessions</p>
                <p className="text-sm text-gray-600">{series.total_sessions} sessions</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Price per Session</p>
                <p className="text-sm text-gray-600">${series.price_per_session.toFixed(2)}</p>
              </div>
            </div>
            {series.discount_percentage > 0 && (
              <div className="mt-2 text-right">
                <p className="text-sm font-medium text-coral">{series.discount_percentage}% discount applied</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-sand pt-4 flex justify-between items-center">
        <div>
          <span className="font-semibold text-primary">${finalPrice.toFixed(2)}</span>
          {series.discount_percentage > 0 && (
            <span className="text-sm text-gray-500 line-through ml-2">${totalPrice.toFixed(2)}</span>
          )}
        </div>
        {isBooked ? (
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">
            Booked
          </Badge>
        ) : showDetails ? (
          <Button onClick={onBook} className="bg-primary hover:bg-primary/90">
            Book Series
          </Button>
        ) : (
          <Link href={`/series/${series.id}`}>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

