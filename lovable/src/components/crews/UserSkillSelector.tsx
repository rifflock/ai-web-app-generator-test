
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSkillLevels, getUserSkill, setUserSkill } from '@/services/crewService';
import { SkillLevel, UserSkill } from '@/types/rowing';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const UserSkillSelector: React.FC = () => {
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [userSkill, setUserSkillState] = useState<UserSkill | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const levels = await getSkillLevels();
      setSkillLevels(levels);
      
      const skill = await getUserSkill();
      setUserSkillState(skill);
      
      if (skill?.skill_level_id) {
        setSelectedSkillId(skill.skill_level_id);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSaveSkill = async () => {
    if (!selectedSkillId) {
      toast.error("Please select a skill level");
      return;
    }

    try {
      setSaving(true);
      const updatedSkill = await setUserSkill(selectedSkillId);
      setUserSkillState(updatedSkill);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
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
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>My Rowing Skill Level</CardTitle>
        <CardDescription>
          Select your rowing skill level for crew matching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select 
            value={selectedSkillId} 
            onValueChange={setSelectedSkillId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your skill level" />
            </SelectTrigger>
            <SelectContent>
              {skillLevels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSaveSkill} 
            disabled={!selectedSkillId || selectedSkillId === userSkill?.skill_level_id || saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Skill Level"}
          </Button>
          
          {userSkill && userSkill.skill_level && (
            <p className="text-sm text-muted-foreground text-center">
              Current skill level: <span className="font-medium">{userSkill.skill_level.name}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSkillSelector;
