import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Users, Search, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createDirectConversation,
  createGroupConversation
} from '../lib/api';
import type { Conversation, Message, Profile } from '../lib/types';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') return conversation.name;
    const otherParticipant = conversation.participants?.find(p => p.profile?.id !== user?.id);
    return otherParticipant?.profile?.full_name || 'Unknown User';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-12 h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="col-span-4 border-r">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-ocean-900">Messages</h2>
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="p-2 text-ocean-600 hover:text-ocean-800 rounded-full hover:bg-ocean-50"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-ocean-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {conversation.type === 'group' ? (
                        <div className="bg-ocean-100 p-2 rounded-full">
                          <Users className="h-6 w-6 text-ocean-600" />
                        </div>
                      ) : (
                        <div className="bg-ocean-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="text-ocean-600 font-medium">
                            {getConversationName(conversation).charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getConversationName(conversation)}
                      </div>
                      {conversation.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                    {conversation.last_message && (
                      <div className="text-xs text-gray-400">
                        {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    {selectedConversation.type === 'group' ? (
                      <div className="bg-ocean-100 p-2 rounded-full">
                        <Users className="h-6 w-6 text-ocean-600" />
                      </div>
                    ) : (
                      <div className="bg-ocean-100 w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-ocean-600 font-medium">
                          {getConversationName(selectedConversation).charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getConversationName(selectedConversation)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.participants?.length} participants
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? 'bg-ocean-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.sender_id !== user?.id && (
                          <p className="text-xs font-medium mb-1">
                            {message.sender?.full_name}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}