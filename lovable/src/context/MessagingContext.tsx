
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Conversation, Message, ConversationParticipant } from '@/types/messaging';

interface MessagingContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  setCurrentConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => Promise<void>;
  createConversation: (name: string | null, participants: string[], isGroup: boolean) => Promise<Conversation | null>;
  refreshConversations: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setLoadingConversations(true);
      
      const { data: participations, error: participationsError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);
        
      if (participationsError) throw participationsError;
      
      if (participations && participations.length > 0) {
        const conversationIds = participations.map(p => p.conversation_id);
        
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('last_message_at', { ascending: false });
          
        if (conversationsError) throw conversationsError;
        
        setConversations(conversationsData as Conversation[]);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for current conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at');
        
      if (error) throw error;
      
      setMessages(data as Message[] || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async (content: string) => {
    if (!user || !currentConversation) return;

    try {
      const newMessage = {
        conversation_id: currentConversation.id,
        sender_id: user.id,
        content,
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
      
      if (error) throw error;
      
      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentConversation.id);
        
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Create conversation
  const createConversation = async (name: string | null, participantIds: string[], isGroup: boolean): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      // Create the conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          name: isGroup ? name : null,
          is_group: isGroup,
        })
        .select()
        .single();
        
      if (conversationError) throw conversationError;

      // Add the current user as an admin
      const { error: creatorError } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationData.id,
          user_id: user.id,
          is_admin: true,
        });
        
      if (creatorError) throw creatorError;
      
      // Add other participants
      for (const participantId of participantIds) {
        if (participantId !== user.id) {
          const { error } = await supabase
            .from('conversation_participants')
            .insert({
              conversation_id: conversationData.id,
              user_id: participantId,
              is_admin: false,
            });
            
          if (error) {
            console.error('Error adding participant:', error);
          }
        }
      }

      await fetchConversations();
      return conversationData as Conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messaging-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          
          if (currentConversation && newMessage.conversation_id === currentConversation.id) {
            setMessages(prev => [...prev, newMessage]);
          }
          
          // Update conversation order when a new message comes in
          if (newMessage.sender_id !== user.id) {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation]);
  
  // Fetch messages when current conversation changes
  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  // Fetch conversations on mount and when user changes
  useEffect(() => {
    fetchConversations();
  }, [user]);
  
  const refreshConversations = async () => {
    await fetchConversations();
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    setCurrentConversation,
    sendMessage,
    createConversation,
    refreshConversations
  };

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

export default MessagingProvider;
