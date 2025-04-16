
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserCrews, getSkillLevels, triggerCrewMatching } from '@/services/crewService';
import { Crew, CrewMember, SkillLevel } from '@/types/rowing';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CrewListProps {
  onSelectCrew?: (crew: Crew) => void;
}

const CrewList: React.FC<CrewListProps> = ({ onSelectCrew }) => {
  const { user } = useAuth();
  const [crews, setCrews] = useState<any[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>({});
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get skill levels first for display
      const levels = await getSkillLevels();
      const levelsMap: Record<string, SkillLevel> = {};
      levels.forEach(level => {
        levelsMap[level.id] = level;
      });
      setSkillLevels(levelsMap);
      
      // Then get user's crews
      const userCrews = await getUserCrews();
      setCrews(userCrews);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRunMatching = async () => {
    setMatching(true);
    await triggerCrewMatching();
    
    // Refresh the crew list
    const userCrews = await getUserCrews();
    setCrews(userCrews);
    setMatching(false);
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
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Crews</CardTitle>
          <CardDescription>
            Rowing crews you're part of
          </CardDescription>
        </div>
        <Button 
          onClick={handleRunMatching} 
          disabled={matching}
          variant="outline"
          size="sm"
        >
          {matching ? "Matching..." : "Find Crew Matches"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {crews.length === 0 ? (
            <div className="p-4 text-center border rounded-lg">
              <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-medium mb-1">No Crews Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't been matched to any crews yet.
              </p>
              <div className="text-sm text-muted-foreground text-left space-y-2">
                <p>To get matched to a crew:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Set your skill level</li>
                  <li>Add your weekly availability</li>
                  <li>Click "Find Crew Matches" above</li>
                </ol>
              </div>
            </div>
          ) : (
            crews.map((crewMember: any) => (
              <Card key={crewMember.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{crewMember.crew.name}</h3>
                      {crewMember.crew.skill_level_id && (
                        <Badge variant="outline" className="mt-1">
                          {skillLevels[crewMember.crew.skill_level_id]?.name || 'Unknown level'}
                        </Badge>
                      )}
                    </div>
                    {crewMember.is_leader && (
                      <Badge variant="secondary">Leader</Badge>
                    )}
                  </div>
                  
                  {crewMember.crew.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {crewMember.crew.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Members:</span> {crewMember.crew.members_count || 'Unknown'}
                    </div>
                    {onSelectCrew && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectCrew(crewMember.crew)}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrewList;
