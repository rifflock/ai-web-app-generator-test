"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserConversations, subscribeToConversations, type Conversation } from "@/utils/messaging-service"
import { createClient } from "@supabase/supabase-js"
import { MessageSquarePlus, Search, Users } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ConversationListProps {
  selectedId?: string
  onSelectConversation: (conversation: Conversation) => void
  onNewConversation: () => void
}

export function ConversationList({ selectedId, onSelectConversation, onNewConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserId(data.user.id)
          const conversationsData = await getUserConversations()
          setConversations(conversationsData)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  useEffect(() => {
    if (!userId) return

    const subscription = subscribeToConversations(userId, async () => {
      // Refresh conversations when there are updates
      try {
        const conversationsData = await getUserConversations()
        setConversations(conversationsData)
      } catch (error) {
        console.error("Error refreshing conversations:", error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // For group chats, search by name
    if (conversation.is_group && conversation.name) {
      return conversation.name.toLowerCase().includes(searchLower)
    }

    // For DMs, search by participant names
    return conversation.participants?.some(
      (participant) =>
        participant.profiles &&
        `${participant.profiles.first_name} ${participant.profiles.last_name}`.toLowerCase().includes(searchLower),
    )
  })

  const getConversationName = (conversation: Conversation) => {
    if (conversation.is_group) return conversation.name

    // For DMs, show the other person's name
    const otherParticipant = conversation.participants?.find((p) => p.user_id !== userId && p.profiles)

    return otherParticipant?.profiles
      ? `${otherParticipant.profiles.first_name} ${otherParticipant.profiles.last_name}`
      : "Unknown User"
  }

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) return "No messages yet"

    return conversation.last_message.content.length > 30
      ? `${conversation.last_message.content.substring(0, 30)}...`
      : conversation.last_message.content
  }

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.last_message) return ""

    return formatDistanceToNow(new Date(conversation.last_message.created_at), {
      addSuffix: true,
    })
  }

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="p-3 border-b border-sand">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b border-sand">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-sand focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageSquarePlus className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 mb-4">No conversations found</p>
            <Button onClick={onNewConversation} className="bg-primary hover:bg-primary/90">
              Start a conversation
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-sand">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full text-left p-3 hover:bg-sand-light transition-colors ${
                  selectedId === conversation.id ? "bg-sand-light" : ""
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    {conversation.is_group ? (
                      <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary font-medium text-lg">
                          {getConversationName(conversation).charAt(0)}
                        </span>
                      </div>
                    )}
                    {conversation.unread_count > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-coral text-white h-5 min-w-5 flex items-center justify-center rounded-full p-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-navy truncate">{getConversationName(conversation)}</h3>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {getLastMessageTime(conversation)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{getLastMessagePreview(conversation)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-sand">
        <Button onClick={onNewConversation} className="w-full bg-primary hover:bg-primary/90">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
    </div>
  )
}

