
import React, { useState } from 'react';
import { makeDonation } from '@/services/rowingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartHandshake } from 'lucide-react';

const DonationForm: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const presetAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsLoading(true);
    try {
      await makeDonation(Number(amount));
      setAmount('');
    } catch (error) {
      console.error('Donation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <HeartHandshake className="h-5 w-5 mr-2 text-nautical-coral" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          Support our rowing club with a donation. All donations go towards equipment, 
          facility maintenance, and youth programs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset}
                </Button>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-muted-foreground">$</span>
              </div>
              <Input
                className="pl-8"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter custom amount"
                type="number"
                min="1"
                step="1"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!amount || isLoading || isNaN(Number(amount)) || Number(amount) <= 0}
        >
          {isLoading ? 'Processing...' : 'Donate Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonationForm;
