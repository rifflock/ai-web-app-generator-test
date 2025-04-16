
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, UserCheck, AlertCircle, Edit, Ship, Wallet, HeartHandshake } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Import our new rowing components
import SessionList from '@/components/rowing/SessionList';
import RegistrationList from '@/components/rowing/RegistrationList';
import PackageList from '@/components/rowing/PackageList';
import UserPackageList from '@/components/rowing/UserPackageList';
import DonationForm from '@/components/rowing/DonationForm';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return <div>Loading...</div>;
  }

  // Format availability
  const formatAvailability = (days: string[] | undefined) => {
    if (!days || days.length === 0) return 'Not specified';
    
    // Capitalize first letter of each day
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
  };

  // Format experience level
  const formatExperience = (exp: string | undefined) => {
    if (!exp) return 'Not specified';
    
    switch (exp) {
      case 'beginner':
        return 'Beginner (< 1 year)';
      case 'intermediate':
        return 'Intermediate (1-3 years)';
      case 'advanced':
        return 'Advanced (3-5 years)';
      case 'expert':
        return 'Expert (5+ years)';
      default:
        return exp.charAt(0).toUpperCase() + exp.slice(1);
    }
  };

  return (
    <div className="container px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.firstName || user.email.split('@')[0]}</h1>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCheck size={18} />
            <span>My Profile</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Ship size={18} />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Wallet size={18} />
            <span>Packages</span>
          </TabsTrigger>
          <TabsTrigger value="donate" className="flex items-center gap-2">
            <HeartHandshake size={18} />
            <span>Donate</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your personal and rowing details</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p className="text-lg">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Experience Level</h3>
                    <p className="text-lg">{formatExperience(user.experience)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Preferred Position</h3>
                    <p className="text-lg">{user.preferences?.position ? (user.preferences.position.charAt(0).toUpperCase() + user.preferences.position.slice(1)) : 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Boat Types</h3>
                    <p className="text-lg">{user.preferences?.boatType?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Crew Sizes</h3>
                    <p className="text-lg">{user.preferences?.crewSize?.join(', ') || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Your rowing schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock size={18} />
                    <h3 className="font-medium">Available Days</h3>
                  </div>
                  <p>{formatAvailability(user.availability)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3 glass-card">
              <CardHeader>
                <CardTitle>Achievements & Metrics</CardTitle>
                <CardDescription>Track your rowing progress</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">0</div>
                  <p className="text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">0</div>
                  <p className="text-muted-foreground">Crews Joined</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">0</div>
                  <p className="text-muted-foreground">Competitions</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">0</div>
                  <p className="text-muted-foreground">Distance (km)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Browse and register for available rowing sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionList />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>My Registrations</CardTitle>
                  <CardDescription>Sessions you've registered for</CardDescription>
                </CardHeader>
                <CardContent>
                  <RegistrationList />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="packages">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Rowing Packages</CardTitle>
                  <CardDescription>Choose a package that fits your schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <PackageList />
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>My Packages</CardTitle>
                  <CardDescription>Your active and past rowing packages</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserPackageList />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="donate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DonationForm />
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Why Support Us?</CardTitle>
                <CardDescription>Your donations make a difference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  RowCrew is dedicated to making rowing accessible to everyone in our community. 
                  Your generous donations help us:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Maintain and upgrade our rowing equipment</li>
                  <li>Support youth development programs</li>
                  <li>Provide scholarships for rowers in need</li>
                  <li>Organize community events and competitions</li>
                  <li>Improve our training facilities</li>
                </ul>
                <p className="font-medium text-nautical-blue pt-2">
                  Thank you for your support!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
