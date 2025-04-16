
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserPackages, formatCurrency, formatDateTime } from '@/services/rowingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Layers, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const UserPackageList: React.FC = () => {
  const { data: userPackages, isLoading } = useQuery({
    queryKey: ['userPackages'],
    queryFn: getUserPackages
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!userPackages || userPackages.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">You don't have any active packages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {userPackages.map((userPackage: any) => {
        const totalSessions = userPackage.packages.sessions_included;
        const sessionsUsed = totalSessions - userPackage.sessions_remaining;
        const progressPercentage = (sessionsUsed / totalSessions) * 100;
        
        const endDate = new Date(userPackage.end_date);
        const today = new Date();
        const isExpired = endDate < today || userPackage.status === 'expired';
        
        return (
          <Card 
            key={userPackage.id} 
            className={`bg-white/50 backdrop-blur-sm ${isExpired ? 'border-muted' : 'border-primary/30'}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{userPackage.packages.name}</CardTitle>
                  <CardDescription>{userPackage.packages.description}</CardDescription>
                </div>
                <div className="flex items-center">
                  {userPackage.status === 'active' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">Expired</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 mr-1 text-nautical-blue" />
                    <span>Sessions: {userPackage.sessions_remaining}/{totalSessions}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-nautical-blue" />
                    <span>Expires: {formatDateTime(userPackage.end_date).split(',')[0]}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Sessions used</span>
                    <span>{sessionsUsed} of {totalSessions}</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={isExpired ? "bg-muted" : ""}
                  />
                </div>
                
                <div className="text-sm">
                  <div className="flex justify-between pb-1">
                    <span>Purchased on:</span>
                    <span>{new Date(userPackage.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between pb-1 font-medium">
                    <span>Amount paid:</span>
                    <span>{formatCurrency(userPackage.packages.price_cents)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default UserPackageList;
