"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ConversationList } from "./conversation-list"
import { ConversationView } from "./conversation-view"
import { NewConversationModal } from "./new-conversation-modal"
import { getUserConversations, subscribeToConversations, type Conversation } from "@/utils/messaging-service"
import { createClient } from "@supabase/supabase-js"
import { MessageSquare } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function MessagingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndUnreadCount = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          setUserId(data.user.id)
          const conversations = await getUserConversations()
          const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
          setUnreadCount(totalUnread)
        }
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    fetchUserAndUnreadCount()
  }, [])

  useEffect(() => {
    if (!userId) return

    const subscription = subscribeToConversations(userId, async () => {
      try {
        const conversations = await getUserConversations()
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        setUnreadCount(totalUnread)
      } catch (error) {
        console.error("Error refreshing unread count:", error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleNewConversation = () => {
    setShowNewConversationModal(true)
  }

  const handleConversationCreated = async (conversationId: string) => {
    try {
      const conversations = await getUserConversations()
      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation) {
        setSelectedConversation(conversation)
      }
      setShowNewConversationModal(false)
    } catch (error) {
      console.error("Error finding new conversation:", error)
    }
  }

  const handleBack = () => {
    setSelectedConversation(null)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 border-none"
          >
            <MessageSquare className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-coral text-white text-xs h-5 min-w-5 rounded-full flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 sm:max-w-md">
          <div className="flex h-full">
            {!selectedConversation ? (
              <ConversationList
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            ) : (
              <ConversationView conversation={selectedConversation} onBack={handleBack} isMobile={true} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
    </>
  )
}

