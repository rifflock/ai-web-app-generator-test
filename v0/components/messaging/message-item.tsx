"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/utils/messaging-service"

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const [showTimestamp, setShowTimestamp] = useState(false)

  const toggleTimestamp = () => {
    setShowTimestamp(!showTimestamp)
  }

  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true })

  return (
    <div
      className={cn(
        "group flex w-full max-w-xs md:max-w-md lg:max-w-lg space-y-2 mb-4",
        isCurrentUser ? "ml-auto justify-end" : "mr-auto justify-start",
      )}
    >
      <div
        className={cn(
          "flex flex-col space-y-1 rounded-lg px-4 py-2 text-sm",
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-sand-light text-navy border border-sand",
        )}
        onClick={toggleTimestamp}
      >
        {!isCurrentUser && message.sender && (
          <span className="text-xs font-medium text-gray-500">
            {message.sender.first_name} {message.sender.last_name}
          </span>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        <div
          className={cn(
            "flex items-center justify-end space-x-1",
            showTimestamp ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <span className="text-xs opacity-70">{formattedTime}</span>
          {isCurrentUser &&
            (message.is_read ? (
              <CheckCheck className="h-3 w-3 opacity-70" />
            ) : (
              <Check className="h-3 w-3 opacity-70" />
            ))}
        </div>
      </div>
    </div>
  )
}

