
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPackages, purchasePackage, formatCurrency } from '@/services/rowingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PackageList: React.FC = () => {
  const { data: packages, isLoading, refetch } = useQuery({
    queryKey: ['packages'],
    queryFn: getPackages
  });

  const handlePurchase = async (packageId: string) => {
    try {
      await purchasePackage(packageId);
      refetch();
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No packages available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {packages.map((pkg) => (
        <Card 
          key={pkg.id} 
          className="bg-white/50 backdrop-blur-sm flex flex-col"
        >
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">
              {formatCurrency(pkg.price_cents)}
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>{pkg.sessions_included} sessions</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                <span>Valid for {pkg.duration_weeks} weeks</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-nautical-blue" />
                <span>{(pkg.price_cents / pkg.sessions_included / 100).toFixed(2)} per session</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handlePurchase(pkg.id)}
            >
              Purchase
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PackageList;
