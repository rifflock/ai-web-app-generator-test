
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserAvailability, addUserAvailability, removeUserAvailability, getDayName, formatAvailabilityTime } from '@/services/crewService';
import { UserAvailability } from '@/types/rowing';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

const AvailabilityManager: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<UserAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [day, setDay] = useState('0');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      const data = await getUserAvailability();
      setAvailabilities(data);
      setLoading(false);
    };

    fetchAvailability();
  }, []);

  const handleAddAvailability = async () => {
    try {
      setAdding(true);
      const newAvailability = await addUserAvailability(
        parseInt(day), 
        startTime, 
        endTime
      );
      setAvailabilities([...availabilities, newAvailability]);
      
      // Reset form
      setDay('0');
      setStartTime('08:00');
      setEndTime('10:00');
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAvailability = async (id: string) => {
    try {
      await removeUserAvailability(id);
      setAvailabilities(availabilities.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>My Availability</CardTitle>
        <CardDescription>
          Add your weekly rowing availability for crew matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current availability */}
          {availabilities.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Availability:</h3>
              <div className="space-y-2">
                {availabilities.map((availability) => (
                  <div 
                    key={availability.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <span className="text-sm">
                      {formatAvailabilityTime(availability)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAvailability(availability.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No availability added yet. Add your weekly availability below.
            </p>
          )}

          {/* Add new availability */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Add New Availability:</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <Select 
                  value={day} 
                  onValueChange={setDay}
                >
                  <SelectTrigger id="day" className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input 
                    id="start-time" 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input 
                    id="end-time" 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleAddAvailability}
                disabled={adding || endTime <= startTime}
              >
                {adding ? "Adding..." : "Add Availability"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
