"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getSessionAttendance, recordAttendance } from "@/utils/session-service"
import { formatDateTime } from "@/utils/date-utils"
import { CheckCircle, XCircle, Clock, Search, UserCheck } from "lucide-react"

interface AttendanceRecord {
  id: string
  booking_id: string
  session_id: string
  user_id: string
  status: "present" | "absent" | "late"
  check_in_time?: string
  notes?: string
  profiles: {
    first_name: string
    last_name: string
  }
}

interface AttendanceTrackerProps {
  sessionId: string
  sessionDate: string
  isAdmin?: boolean
}

export function AttendanceTracker({ sessionId, sessionDate, isAdmin = false }: AttendanceTrackerProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getSessionAttendance(sessionId)
        setAttendanceRecords(data as AttendanceRecord[])
      } catch (err: any) {
        setError(err.message || "Failed to load attendance records")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [sessionId])

  const handleStatusChange = async (userId: string, status: "present" | "absent" | "late") => {
    try {
      // Find the existing record
      const existingRecord = attendanceRecords.find((record) => record.user_id === userId)

      // Record the attendance
      const newAttendance = await recordAttendance({
        booking_id: existingRecord?.booking_id || "",
        session_id: sessionId,
        user_id: userId,
        status,
        check_in_time: status !== "absent" ? new Date().toISOString() : undefined,
      })

      // Update the local state
      setAttendanceRecords((prev) => {
        if (existingRecord) {
          return prev.map((record) => (record.user_id === userId ? { ...record, ...newAttendance } : record))
        } else {
          return [...prev, newAttendance as unknown as AttendanceRecord]
        }
      })
    } catch (err: any) {
      setError(err.message || "Failed to update attendance")
    }
  }

  const filteredRecords = attendanceRecords.filter((record) => {
    const fullName = `${record.profiles.first_name} ${record.profiles.last_name}`.toLowerCase()
    const matchesSearch = searchTerm ? fullName.includes(searchTerm.toLowerCase()) : true
    const matchesStatus = selectedStatus ? record.status === selectedStatus : true
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Present
          </Badge>
        )
      case "absent":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Absent
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Late
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            Unknown
          </Badge>
        )
    }
  }

  return (
    <Card className="border-sand shadow-sm">
      <CardHeader className="bg-sand-light border-b border-sand">
        <CardTitle className="text-navy flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Attendance Tracker
        </CardTitle>
        <CardDescription>Session on {formatDateTime(sessionDate)}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-sand focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={selectedStatus || ""} onValueChange={(value) => setSelectedStatus(value || null)}>
              <SelectTrigger className="border-sand focus:ring-primary">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading attendance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.profiles.first_name} {record.profiles.last_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>{record.check_in_time ? formatDateTime(record.check_in_time) : "-"}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-green-500 ${record.status === "present" ? "bg-green-50" : ""}`}
                            onClick={() => handleStatusChange(record.user_id, "present")}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-amber-500 ${record.status === "late" ? "bg-amber-50" : ""}`}
                            onClick={() => handleStatusChange(record.user_id, "late")}
                          >
                            <Clock className="h-4 w-4 text-amber-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-red-500 ${record.status === "absent" ? "bg-red-50" : ""}`}
                            onClick={() => handleStatusChange(record.user_id, "absent")}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

