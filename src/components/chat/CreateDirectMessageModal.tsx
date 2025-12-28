
import React, { useState } from "react";
import { User } from "@/types/chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import Avatar from "./Avatar";

interface CreateDirectMessageModalProps {
  users: User[];
  currentUser: User;
  onStartConversation: (userId: string) => void;
}

const CreateDirectMessageModal: React.FC<CreateDirectMessageModalProps> = ({
  users,
  currentUser,
  onStartConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  console.log(filteredUsers);

  const handleSelectUser = (userId: string) => {
    onStartConversation(userId);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-ecole-primary text-white font-medium py-2 rounded-md flex items-center justify-center hover:bg-ecole-primary/90">
          <MessageSquare size={18} className="mr-2" />
          Nouvelle conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Démarrer une conversation</DialogTitle>
          <DialogDescription>
            Recherchez un utilisateur pour démarrer une conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="search-users">Rechercher un utilisateur</Label>
            <Input
              id="search-users"
              placeholder="Nom d'utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="border rounded-md max-h-60 overflow-y-auto bg-white">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-2 flex items-center hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <Avatar
                    src={user.photo}
                    alt={user.name}
                    status={user.status}
                  />
                  <div className="ml-2">
                    <div className="text-sm  font-medium">{user.name}</div>
                    <div className="text-xs text-ecole-meta">
                      {user.role === "teacher" ? "Professeur" :
                        user.role === "student" ? "Élève" : "Personnel"}
                      {user.status === "offline" && user.lastSeen && (
                        <span className="ml-1">· Vu {new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                  {user.status === "online" ? (
                    <div className="ml-auto w-2 h-2 bg-ecole-accent rounded-full"></div>
                  ) : (
                    <div className="ml-auto w-2 h-2 bg-ecole-offline rounded-full"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-ecole-meta">
                {searchTerm ? "Aucun utilisateur trouvé" : "Commencez à taper pour rechercher des utilisateurs"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDirectMessageModal;
