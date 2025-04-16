
import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MessageListProps {
  onBack: () => void;
}

const MessageList: React.FC<MessageListProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { currentConversation, messages, sendMessage, loadingMessages } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage.trim());
    setNewMessage('');
  };
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            if (currentConversation) {
              onBack();
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold">
          {currentConversation?.name || 'Direct Message'}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          // Loading skeletons
          Array(4).fill(0).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-10 ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'} rounded-lg`} />
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No messages yet. Send the first message!
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="break-words">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {format(new Date(message.created_at), 'h:mm a')}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-end gap-2">
        <Textarea
          placeholder="Type your message..."
          className="min-h-[60px] resize-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default MessageList;
