"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (value: string) => void
}

export function TimePickerInput({ className, value, onChange, ...props }: TimePickerInputProps) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")

  // Parse the value into hours and minutes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHours(h)
      setMinutes(m)
    }
  }, [value])

  // Update the value when hours or minutes change
  const updateValue = (newHours: string, newMinutes: string) => {
    // Validate hours (0-23)
    let validHours = newHours
    if (newHours !== "") {
      const h = Number.parseInt(newHours, 10)
      if (isNaN(h) || h < 0) {
        validHours = "00"
      } else if (h > 23) {
        validHours = "23"
      } else {
        validHours = h.toString().padStart(2, "0")
      }
    }

    // Validate minutes (0-59)
    let validMinutes = newMinutes
    if (newMinutes !== "") {
      const m = Number.parseInt(newMinutes, 10)
      if (isNaN(m) || m < 0) {
        validMinutes = "00"
      } else if (m > 59) {
        validMinutes = "59"
      } else {
        validMinutes = m.toString().padStart(2, "0")
      }
    }

    if (validHours && validMinutes) {
      onChange(`${validHours}:${validMinutes}`)
    }
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = e.target.value
    setHours(newHours)
    updateValue(newHours, minutes)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value
    setMinutes(newMinutes)
    updateValue(hours, newMinutes)
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Input
        type="number"
        min={0}
        max={23}
        value={hours}
        onChange={handleHoursChange}
        className="w-16 text-center border-sand focus:border-primary focus:ring-primary"
        placeholder="HH"
        {...props}
      />
      <span className="mx-2 text-gray-500">:</span>
      <Input
        type="number"
        min={0}
        max={59}
        value={minutes}
        onChange={handleMinutesChange}
        className="w-16 text-center border-sand focus:border-primary focus:ring-primary"
        placeholder="MM"
        {...props}
      />
    </div>
  )
}

