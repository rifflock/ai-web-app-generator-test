"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { createGroupConversation, getOrCreateDirectMessage } from "@/utils/messaging-service"
import { createClient } from "@supabase/supabase-js"
import { Loader2, Search, User, Users } from "lucide-react"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onConversationCreated: (conversationId: string) => void
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
}

export function NewConversationModal({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) {
  const [conversationType, setConversationType] = useState<"direct" | "group">("direct")
  const [groupName, setGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setUsers([])
        return
      }

      setLoading(true)
      try {
        const { data: currentUser } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .neq("id", currentUser.user?.id)
          .limit(10)

        if (error) throw error
        setUsers(data as UserProfile[])
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleUserSelect = (userId: string) => {
    if (conversationType === "direct") {
      setSelectedUsers([userId])
    } else {
      setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
    }
  }

  const handleCreateConversation = async () => {
    if (conversationType === "direct" && selectedUsers.length !== 1) {
      return
    }

    if (conversationType === "group" && (selectedUsers.length < 1 || !groupName.trim())) {
      return
    }

    setCreating(true)
    try {
      let conversationId: string

      if (conversationType === "direct") {
        conversationId = await getOrCreateDirectMessage(selectedUsers[0])
      } else {
        const conversation = await createGroupConversation(groupName, selectedUsers)
        conversationId = conversation.id
      }

      onConversationCreated(conversationId)
      resetForm()
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setConversationType("direct")
    setGroupName("")
    setSearchTerm("")
    setSelectedUsers([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={conversationType}
            onValueChange={(value) => {
              setConversationType(value as "direct" | "group")
              setSelectedUsers([])
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Direct Message
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="group" id="group" />
              <Label htmlFor="group" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Group Chat
              </Label>
            </div>
          </RadioGroup>

          {conversationType === "group" && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="border-sand focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{conversationType === "direct" ? "Select User" : "Add Participants"}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-9 border-sand focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-md border-sand">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "No users found" : "Type to search for users"}
              </div>
            ) : (
              <div className="divide-y divide-sand">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-sand-light cursor-pointer"
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="mr-3">
                      <div className="h-10 w-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="text-secondary font-medium">{user.first_name.charAt(0)}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {conversationType === "direct" ? (
                      <RadioGroupItem
                        value={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                    ) : (
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleUserSelect(user.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {conversationType === "group" && selectedUsers.length > 0 && (
            <div>
              <Label className="mb-2 block">Selected Users ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {users
                  .filter((user) => selectedUsers.includes(user.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {user.first_name} {user.last_name}
                      <button
                        type="button"
                        className="ml-2 text-primary/70 hover:text-primary"
                        onClick={() => handleUserSelect(user.id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={
              creating ||
              (conversationType === "direct" && selectedUsers.length !== 1) ||
              (conversationType === "group" && (selectedUsers.length < 1 || !groupName.trim()))
            }
            className="bg-primary hover:bg-primary/90"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Conversation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

