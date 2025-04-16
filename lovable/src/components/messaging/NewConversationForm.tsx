
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMessaging } from '@/context/MessagingContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface NewConversationFormProps {
  onComplete: () => void;
}

const NewConversationForm: React.FC<NewConversationFormProps> = ({ onComplete }) => {
  const { createConversation, setCurrentConversation } = useMessaging();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  // Mock function to fetch users
  // In a real app, you'd fetch users from your database
  useEffect(() => {
    const fetchUsers = async () => {
      // For demo purposes, let's create some mock users
      // In a real app, you would fetch users from your database
      setUsers([
        {
          id: 'user-1',
          email: 'coach@example.com',
          firstName: 'John',
          lastName: 'Coach'
        },
        {
          id: 'user-2', 
          email: 'rower1@example.com',
          firstName: 'Alice',
          lastName: 'Rower'
        },
        {
          id: 'user-3',
          email: 'rower2@example.com',
          firstName: 'Bob',
          lastName: 'Crew'
        }
      ]);
    };
    
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    if (isGroup && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    try {
      setLoading(true);
      
      const name = isGroup ? groupName.trim() : null;
      const conversation = await createConversation(name, selectedUsers, isGroup);
      
      if (conversation) {
        setCurrentConversation(conversation);
        onComplete();
        toast.success(`${isGroup ? 'Group' : 'Conversation'} created successfully`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isGroup"
            checked={isGroup}
            onCheckedChange={(checked) => setIsGroup(checked === true)}
          />
          <Label htmlFor="isGroup">Create group conversation</Label>
        </div>
        
        {isGroup && (
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
            />
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Select Users</Label>
        <div className="border rounded-md p-2 max-h-60 overflow-y-auto space-y-1">
          {users.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Loading users...
            </div>
          ) : (
            users
              .filter(u => u.id !== currentUser?.id) // Don't show the current user
              .map(user => (
                <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                    <div>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </Label>
                </div>
              ))
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create
        </Button>
      </div>
    </form>
  );
};

export default NewConversationForm;
