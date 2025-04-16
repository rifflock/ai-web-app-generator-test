
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import CustomHeader from '@/components/layout/CustomHeader';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Calendar as CalendarIcon } from 'lucide-react';
import UserSkillSelector from '@/components/crews/UserSkillSelector';
import AvailabilityManager from '@/components/crews/AvailabilityManager';
import CrewList from '@/components/crews/CrewList';
import CrewSessionList from '@/components/crews/CrewSessionList';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const CrewsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Crews - RowCrew</title>
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <CustomHeader />
        
        <main className="flex-grow container px-4 py-8 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Crew Matching</h1>
          </div>
          
          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Users size={18} />
                <span>Preferences & Crews</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <CalendarIcon size={18} />
                <span>Crew Sessions</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <UserSkillSelector />
                  <AvailabilityManager />
                </div>
                
                <div>
                  <CrewList />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sessions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CrewSessionList />
                
                <div>
                  {/* Placeholder for future crew details or another component */}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CrewsPage;
