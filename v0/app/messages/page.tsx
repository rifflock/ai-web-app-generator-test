"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ConversationView } from "@/components/messaging/conversation-view"
import { NewConversationModal } from "@/components/messaging/new-conversation-modal"
import { getConversation, type Conversation } from "@/utils/messaging-service"
import { createClient } from "@supabase/supabase-js"
import { MessageSquare } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (conversationId) {
      setLoading(true)
      getConversation(conversationId)
        .then((conversation) => {
          setSelectedConversation(conversation)
        })
        .catch((error) => {
          console.error("Error fetching conversation:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setSelectedConversation(null)
    }
  }, [conversationId])

  const handleSelectConversation = (conversation: Conversation) => {
    router.push(`/messages?id=${conversation.id}`)
  }

  const handleNewConversation = () => {
    setShowNewConversationModal(true)
  }

  const handleConversationCreated = (conversationId: string) => {
    router.push(`/messages?id=${conversationId}`)
    setShowNewConversationModal(false)
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-navy mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your crew members and coaches</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-sand overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            <div className="w-80 border-r border-sand h-full">
              <ConversationList
                selectedId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
            <div className="flex-1">
              {selectedConversation ? (
                <ConversationView conversation={selectedConversation} onBack={() => router.push("/messages")} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-medium text-navy mb-2">Select a conversation</h2>
                  <p className="text-gray-500 max-w-md mb-6">
                    Choose an existing conversation from the list or start a new one to begin messaging
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
    </PageLayout>
  )
}

