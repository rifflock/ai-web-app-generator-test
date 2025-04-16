import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { MessageSquare, X, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchConversations, fetchMessages, sendMessage, updateLastRead } from '../lib/api';
import type { Conversation, Message, Profile } from '../lib/types';

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const data = await fetchConversations(user.id);
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await fetchMessages(conversationId);
      setMessages(data);
      if (user) {
        await updateLastRead(conversationId, user.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      const message = await sendMessage(selectedConversation.id, user.id, newMessage.trim());
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') return conversation.name;
    const otherParticipant = conversation.participants?.find(p => p.profile?.id !== user?.id);
    return otherParticipant?.profile?.full_name || 'Unknown User';
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl w-80 flex flex-col" style={{ height: '500px' }}>
          <div className="p-4 border-b flex justify-between items-center bg-ocean-700 text-white rounded-t-lg">
            <h3 className="font-semibold">Messages</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-ocean-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          {selectedConversation ? (
            <>
              <div className="p-3 border-b flex items-center bg-ocean-50">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="mr-2 text-ocean-600 hover:text-ocean-800"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
                <span className="font-medium text-ocean-900">
                  {getConversationName(selectedConversation)}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      message.sender_id === user.id ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_id === user.id
                          ? 'bg-ocean-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-ocean-600 text-white p-2 rounded-lg hover:bg-ocean-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-ocean-600">Loading conversations...</div>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {getConversationName(conversation)}
                      </div>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-ocean-600 text-white p-3 rounded-full hover:bg-ocean-700 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}