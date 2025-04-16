
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Session } from '@/types/rowing';
import { getUpcomingSessions, registerForSession, formatCurrency, formatDateTime } from '@/services/rowingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SessionList: React.FC = () => {
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: getUpcomingSessions
  });

  const handleRegister = async (sessionId: string) => {
    try {
      await registerForSession(sessionId);
      refetch();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No upcoming sessions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session: Session) => (
        <Card key={session.id} className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>{session.description || 'No description provided'}</CardDescription>
              </div>
              <Badge variant={session.session_type === 'regular' ? 'default' : 'secondary'}>
                {session.session_type === 'regular' ? 'Regular' : 'One-off'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDateTime(session.start_time)}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{session.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>Max participants: {session.max_participants}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="font-medium">{formatCurrency(session.price_cents)}</p>
            <Button 
              onClick={() => handleRegister(session.id)}
              className="gap-1"
            >
              Register <ArrowRight size={16} />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SessionList;
