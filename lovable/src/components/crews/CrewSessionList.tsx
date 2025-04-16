
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, Check, X } from 'lucide-react';
import { getUserCrewSessions, getUserAttendanceStatus, updateAttendanceStatus, formatDateTime } from '@/services/crewService';

const CrewSessionList: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      
      const crewSessions = await getUserCrewSessions();
      setSessions(crewSessions);
      
      // Get attendance status for each session
      const statusMap: Record<string, string> = {};
      
      for (const session of crewSessions) {
        const attendance = await getUserAttendanceStatus(session.id);
        if (attendance) {
          statusMap[session.id] = attendance.status;
        }
      }
      
      setAttendanceStatus(statusMap);
      setLoading(false);
    };

    fetchSessions();
  }, []);

  const handleUpdateStatus = async (sessionId: string, status: 'confirmed' | 'declined') => {
    setUpdatingStatus({...updatingStatus, [sessionId]: true});
    
    try {
      const updated = await updateAttendanceStatus(sessionId, status);
      setAttendanceStatus({...attendanceStatus, [sessionId]: updated.status});
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingStatus({...updatingStatus, [sessionId]: false});
    }
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(s => new Date(s.session.start_time) > now);
  };

  const getPastSessions = () => {
    const now = new Date();
    return sessions.filter(s => new Date(s.session.start_time) <= now);
  };

  const renderSession = (session: any) => {
    const status = attendanceStatus[session.id] || 'pending';
    const isUpdating = updatingStatus[session.id] || false;
    const isPast = new Date(session.session.start_time) <= new Date();

    return (
      <Card key={session.id} className="overflow-hidden mb-4 bg-white/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{session.session.title}</h3>
              <p className="text-sm text-muted-foreground">
                Crew: {session.crew.name}
              </p>
            </div>
            <Badge 
              variant={
                status === 'confirmed' ? 'default' : 
                status === 'declined' ? 'destructive' : 
                'secondary'
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          
          <div className="mt-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{formatDateTime(session.session.start_time)}</span>
            </div>
            <p className="mt-1">Location: {session.session.location}</p>
          </div>
          
          {!isPast && status !== 'confirmed' && (
            <Button
              className="mt-3 mr-2"
              size="sm"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(session.id, 'confirmed')}
            >
              <Check className="mr-1 h-4 w-4" />
              Confirm
            </Button>
          )}
          
          {!isPast && status !== 'declined' && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-destructive text-destructive hover:bg-destructive/10"
              disabled={isUpdating}
              onClick={() => handleUpdateStatus(session.id, 'declined')}
            >
              <X className="mr-1 h-4 w-4" />
              Decline
            </Button>
          )}
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingSessions = getUpcomingSessions();
  const pastSessions = getPastSessions();
  
  if (sessions.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>My Crew Sessions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium mb-1">No Sessions Found</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any scheduled crew sessions yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>My Crew Sessions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {upcomingSessions.length > 0 && (
          <>
            <h3 className="font-medium mb-3">Upcoming Sessions</h3>
            {upcomingSessions.map(renderSession)}
          </>
        )}
        
        {pastSessions.length > 0 && (
          <>
            <h3 className="font-medium mb-3 mt-6">Past Sessions</h3>
            {pastSessions.slice(0, 3).map(renderSession)}
            
            {pastSessions.length > 3 && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                + {pastSessions.length - 3} more past sessions
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrewSessionList;
