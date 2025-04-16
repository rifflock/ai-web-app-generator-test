
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Calendar, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    title: "Team Formation",
    description: "Find compatible rowing teammates based on skill level, preferences, and availability.",
    icon: Users,
  },
  {
    title: "Session Scheduling",
    description: "Coordinate training sessions and track attendance across your rowing teams.",
    icon: Calendar,
  },
  {
    title: "Performance Tracking",
    description: "Monitor progress, record achievements, and set goals for your rowing career.",
    icon: CheckCircle,
  }
];

const Index: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-4">
                The Ultimate Rowing Crew Management Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Find your perfect <span className="text-primary">rowing crew</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                RowCrew makes it easy to connect with other rowers, form balanced teams, and schedule practices based on everyone's availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link to={user ? '/dashboard' : '/auth'}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-8 rounded-full">
                    {user ? 'Go to Dashboard' : 'Get Started'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button variant="outline" size="lg" className="font-medium px-8 rounded-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Mockup Image */}
            <div className="mt-16 animate-fade-in">
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl shadow-2xl">
                <div className="bg-gradient-to-br from-primary to-primary/80 absolute inset-0 opacity-20 blur-3xl -z-10"></div>
                <div className="aspect-[16/9] overflow-hidden rounded-t-xl bg-white/80 backdrop-blur-sm">
                  <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Calendar className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-medium">Dashboard Preview</h3>
                      <p className="text-muted-foreground">Team management and scheduling interface</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white py-3 px-4 rounded-b-xl backdrop-blur-sm flex items-center justify-between">
                  <div className="flex space-x-1">
                    <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-4 w-24 rounded-full bg-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-transparent to-secondary/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Everything you need to manage your rowing teams
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive platform helps rowing clubs and individual rowers coordinate more effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-border/50 shadow-sm hover-scale"
                >
                  <div className="rounded-full bg-primary/10 p-3 mb-6">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="rounded-2xl bg-primary/5 border border-primary/20 overflow-hidden">
              <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Ready to find your perfect crew?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Join our community of rowers today and start forming balanced, compatible crews.
                  </p>
                  <Link to={user ? '/dashboard' : '/auth'}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium px-8 rounded-full">
                      {user ? 'Go to Dashboard' : 'Sign Up Now'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex-1 flex justify-center md:justify-end">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center">
                    <Users className="w-24 h-24 md:w-32 md:h-32 text-primary/60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
