
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import { useMessaging } from '@/context/MessagingContext';

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { currentConversation } = useMessaging();

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md p-0 h-[600px] flex flex-col">
          <div className="flex flex-col h-full">
            {!currentConversation ? (
              <ConversationList onSelectConversation={() => {}} />
            ) : (
              <MessageList onBack={() => setOpen(false)} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatWidget;
