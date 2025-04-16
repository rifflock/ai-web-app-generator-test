
import React, { useState } from 'react';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import NewConversationForm from './NewConversationForm';
import { format } from 'date-fns';

interface ConversationListProps {
  onSelectConversation: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { conversations, setCurrentConversation, loadingConversations } = useMessaging();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleSelect = (conversation: any) => {
    setCurrentConversation(conversation);
    onSelectConversation();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Conversation</DialogTitle>
              </DialogHeader>
              <NewConversationForm onComplete={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {loadingConversations ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No conversations yet. Start a new one!
          </div>
        ) : (
          conversations.map(conversation => (
            <button
              key={conversation.id}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-accent w-full text-left mb-1"
              onClick={() => handleSelect(conversation)}
            >
              <div className="flex-shrink-0">
                {conversation.is_group ? (
                  <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {conversation.name || 'Direct Message'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
