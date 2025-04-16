
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardComponent from '@/components/dashboard/Dashboard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in or if onboarding not completed
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!user.onboardingCompleted) {
      navigate('/onboarding');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 pt-24">
        <DashboardComponent />
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
