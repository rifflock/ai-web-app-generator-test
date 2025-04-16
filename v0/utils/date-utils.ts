export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return `${formatDate(d)} at ${formatTime(d)}`
}

export function getDayOfWeekName(dayNumber: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayNumber]
}

export function getDatesBetween(startDate: Date, endDate: Date, daysOfWeek: number[]): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    if (daysOfWeek.includes(dayOfWeek)) {
      dates.push(new Date(currentDate))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

export function getTimeFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toTimeString().substring(0, 5) // Returns "HH:MM"
}

export function combineDateAndTime(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number)
  const result = new Date(date)
  result.setHours(hours, minutes)
  return result
}

