"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MessageItem } from "./message-item"
import { MessageInput } from "./message-input"
import {
  getMessages,
  markAllMessagesAsRead,
  subscribeToMessages,
  type Conversation,
  type Message,
} from "@/utils/messaging-service"
import { createClient } from "@supabase/supabase-js"
import { ArrowLeft, Info, Loader2, MessageSquare, Users } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ConversationViewProps {
  conversation: Conversation
  onBack: () => void
  isMobile?: boolean
}

export function ConversationView({ conversation, onBack, isMobile = false }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserId(data.user.id)
          const messagesData = await getMessages(conversation.id)
          setMessages(messagesData)

          // Mark all messages as read
          await markAllMessagesAsRead(conversation.id)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndMessages()
  }, [conversation.id])

  useEffect(() => {
    if (!conversation.id) return

    const subscription = subscribeToMessages(conversation.id, async (newMessage) => {
      try {
        // Fetch the sender info for the new message
        const { data: senderData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", newMessage.sender_id)
          .single()

        const messageWithSender = {
          ...newMessage,
          sender: senderData,
          is_read: newMessage.sender_id === userId,
        }

        setMessages((prev) => [...prev, messageWithSender])

        // If the message is from someone else, mark it as read
        if (newMessage.sender_id !== userId) {
          await markAllMessagesAsRead(conversation.id)
        }
      } catch (error) {
        console.error("Error processing new message:", error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [conversation.id, userId])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getConversationName = () => {
    if (conversation.is_group) return conversation.name

    // For DMs, show the other person's name
    const otherParticipant = conversation.participants?.find((p) => p.user_id !== userId && p.profiles)

    return otherParticipant?.profiles
      ? `${otherParticipant.profiles.first_name} ${otherParticipant.profiles.last_name}`
      : "Unknown User"
  }

  const getParticipantCount = () => {
    return conversation.participants?.filter((p) => !p.left_at).length || 0
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-sand bg-white">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center flex-1 min-w-0">
          <div className="mr-3">
            {conversation.is_group ? (
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <span className="text-secondary font-medium">{getConversationName()?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-navy truncate">{getConversationName()}</h3>
            <p className="text-xs text-gray-500">
              {conversation.is_group ? `${getParticipantCount()} participants` : "Direct message"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Info className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-sand-light">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-navy mb-1">No messages yet</h3>
            <p className="text-gray-500 max-w-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} isCurrentUser={message.sender_id === userId} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput conversationId={conversation.id} />
    </div>
  )
}

