import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  created_at: string
  updated_at: string
  last_message_at: string | null
  created_by: string
  participants?: ConversationParticipant[]
  last_message?: Message
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  left_at: string | null
  is_admin: boolean
  profiles?: {
    first_name: string
    last_name: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
  attachment_url: string | null
  attachment_type: string | null
  sender?: {
    first_name: string
    last_name: string
  }
  is_read?: boolean
}

// Get all conversations for the current user
export async function getUserConversations() {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        *,
        profiles:user_id(first_name, last_name)
      )
    `)
    .order("last_message_at", { ascending: false, nullsFirst: false })

  if (error) throw error

  // Get the last message for each conversation
  const conversationsWithLastMessage = await Promise.all(
    conversations.map(async (conversation) => {
      const { data: messages, error: messagesError } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name)
        `)
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (messagesError) throw messagesError

      // Get unread count
      const { data: unreadCount, error: unreadError } = await supabase.rpc("get_unread_message_count", {
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })

      if (unreadError) throw unreadError

      const unreadForConversation = unreadCount.find((u) => u.conversation_id === conversation.id)

      return {
        ...conversation,
        last_message: messages[0] || null,
        unread_count: unreadForConversation ? unreadForConversation.unread_count : 0,
      }
    }),
  )

  return conversationsWithLastMessage
}

// Get a single conversation by ID
export async function getConversation(conversationId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      participants:conversation_participants(
        *,
        profiles:user_id(first_name, last_name)
      )
    `)
    .eq("id", conversationId)
    .single()

  if (error) throw error
  return data
}

// Get or create a direct message conversation between two users
export async function getOrCreateDirectMessage(otherUserId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase.rpc("get_or_create_dm_conversation", {
    user1_id: user.user.id,
    user2_id: otherUserId,
  })

  if (error) throw error
  return data
}

// Create a new group conversation
export async function createGroupConversation(name: string, participantIds: string[]) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  // Create the conversation
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .insert({
      name,
      is_group: true,
      created_by: user.user.id,
    })
    .select()
    .single()

  if (conversationError) throw conversationError

  // Add all participants
  const participants = [user.user.id, ...participantIds].map((userId) => ({
    conversation_id: conversation.id,
    user_id: userId,
    is_admin: userId === user.user.id, // Creator is admin
  }))

  const { error: participantsError } = await supabase.from("conversation_participants").insert(participants)

  if (participantsError) throw participantsError

  return conversation
}

// Get messages for a conversation
export async function getMessages(conversationId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!sender_id(first_name, last_name)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) throw error

  // Check which messages are read by the current user
  const messagesWithReadStatus = await Promise.all(
    data.map(async (message) => {
      if (message.sender_id === user.user?.id) {
        // User's own messages are always "read"
        return { ...message, is_read: true }
      }

      const { data: readReceipt, error: readError } = await supabase
        .from("message_reads")
        .select("*")
        .eq("message_id", message.id)
        .eq("user_id", user.user?.id)
        .maybeSingle()

      if (readError) throw readError

      return {
        ...message,
        is_read: !!readReceipt,
      }
    }),
  )

  return messagesWithReadStatus
}

// Send a message
export async function sendMessage(
  conversationId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string,
) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  // Create the message
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.user.id,
      content,
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
    })
    .select()
    .single()

  if (messageError) throw messageError

  // Update the conversation's last_message_at
  const { error: updateError } = await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId)

  if (updateError) throw updateError

  return message
}

// Mark a message as read
export async function markMessageAsRead(messageId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("message_reads")
    .upsert(
      {
        message_id: messageId,
        user_id: user.user.id,
        read_at: new Date().toISOString(),
      },
      { onConflict: "message_id,user_id" },
    )
    .select()

  if (error) throw error
  return data
}

// Mark all messages in a conversation as read
export async function markAllMessagesAsRead(conversationId: string) {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("User not authenticated")

  // Get all unread messages in the conversation
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.user.id)
    .not("id", "in", (subquery) => {
      return subquery.from("message_reads").select("message_id").eq("user_id", user.user.id)
    })

  if (messagesError) throw messagesError

  if (messages.length === 0) return []

  // Mark all as read
  const readReceipts = messages.map((message) => ({
    message_id: message.id,
    user_id: user.user!.id,
    read_at: new Date().toISOString(),
  }))

  const { data, error } = await supabase.from("message_reads").insert(readReceipts).select()

  if (error) throw error
  return data
}

// Subscribe to new messages in a conversation
export function subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      },
    )
    .subscribe()
}

// Subscribe to conversation updates (for unread counts, etc.)
export function subscribeToConversations(userId: string, callback: () => void) {
  return supabase
    .channel(`user_conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
      },
      () => {
        callback()
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "message_reads",
      },
      () => {
        callback()
      },
    )
    .subscribe()
}

