
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserRegistrations, cancelRegistration, formatDateTime } from '@/services/rowingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RegistrationList: React.FC = () => {
  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ['registrations'],
    queryFn: getUserRegistrations
  });

  const handleCancel = async (registrationId: string) => {
    try {
      await cancelRegistration(registrationId);
      refetch();
    } catch (error) {
      console.error('Cancellation error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No registrations found</p>
          <p className="text-muted-foreground mb-4">
            You haven't registered for any rowing sessions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {registrations.map((registration: any) => (
        <Card key={registration.id} className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{registration.sessions.title}</CardTitle>
              <Badge variant={
                registration.status === 'registered' ? 'default' :
                registration.status === 'attended' ? 'secondary' : 
                'destructive'
              }>
                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDateTime(registration.sessions.start_time)}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{registration.sessions.location}</span>
                </div>
              </div>
              
              {registration.status === 'registered' && new Date(registration.sessions.start_time) > new Date() && (
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancel(registration.id)}
                >
                  Cancel Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RegistrationList;
