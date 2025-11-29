
import React, { useState } from "react";
import { User } from "@/types/chat";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, X } from "lucide-react";
import Avatar from "./Avatar";

interface CreateGroupModalProps {
  users: User[];
  currentUser: User;
  onCreateGroup: (name: string, participants: User[]) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  users,
  currentUser,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      !selectedUsers.some((selected) => selected.id === user.id) &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName, selectedUsers);
      setOpen(false);
      setGroupName("");
      setSelectedUsers([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-ecole-accent text-ecole-text font-medium py-2 rounded-md flex items-center justify-center hover:bg-ecole-accent/90">
          <Users size={18} className="mr-2" />
          Nouveau groupe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau groupe</DialogTitle>
          <DialogDescription>
            Donnez un nom au groupe et ajoutez des participants.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="group-name">Nom du groupe</Label>
            <Input
              id="group-name"
              placeholder="Nom du groupe..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center gap-1 bg-ecole-primary/10 rounded-full pl-1 pr-2 py-1"
                >
                  <Avatar 
                    src={user.photo} 
                    alt={user.name} 
                    status={user.status} 
                    className="w-6 h-6" 
                  />
                  <span className="text-xs">{user.name}</span>
                  <button 
                    onClick={() => handleRemoveUser(user.id)}
                    className="text-ecole-meta hover:text-ecole-offline"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="participants">Ajouter des participants</Label>
            <Input
              id="participants"
              placeholder="Rechercher des utilisateurs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {searchTerm && filteredUsers.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-white">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 flex items-center hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleAddUser(user)}
                  >
                    <Avatar 
                      src={user.photo} 
                      alt={user.name} 
                      status={user.status} 
                    />
                    <div className="ml-2">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-ecole-meta">
                        {user.role === "teacher" ? "Professeur" : 
                         user.role === "student" ? "Élève" : "Personnel"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
