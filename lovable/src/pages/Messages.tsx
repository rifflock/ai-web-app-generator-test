
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import ConversationList from '@/components/messaging/ConversationList';
import MessageList from '@/components/messaging/MessageList';
import { useMessaging } from '@/context/MessagingContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { currentConversation, setCurrentConversation } = useMessaging();
  const navigate = useNavigate();
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-24 pb-12 container mx-auto">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border h-[700px] flex">
          {/* Sidebar with conversations */}
          <div className="w-1/3 border-r hidden md:block">
            <ConversationList onSelectConversation={() => {}} />
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex">
            {!currentConversation ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                  <p className="text-muted-foreground mb-4">
                    Select a conversation from the sidebar or create a new one
                  </p>
                  <div className="md:hidden">
                    <ConversationList onSelectConversation={() => {}} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <MessageList onBack={() => setCurrentConversation(null)} />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
