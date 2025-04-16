
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in or if onboarding already completed
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <OnboardingForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Onboarding;
