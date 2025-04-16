"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Paperclip, Send } from "lucide-react"
import { sendMessage } from "@/utils/messaging-service"

interface MessageInputProps {
  conversationId: string
  onMessageSent?: () => void
}

export function MessageInput({ conversationId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [message])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(conversationId, message.trim())
      setMessage("")
      if (onMessageSent) onMessageSent()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="border-t border-sand bg-white p-3">
      <div className="flex items-end space-x-2">
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[150px] resize-none border-sand pr-10 focus:border-primary focus:ring-primary"
            rows={1}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute bottom-1 right-1 h-8 w-8 text-gray-500 hover:text-primary"
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="h-10 w-10 rounded-full bg-primary text-white hover:bg-primary/90"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}

