
import React, { useState } from "react";
import { User } from "@/types/chat";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, UserPlus } from "lucide-react";
import Avatar from "./Avatar";

interface AddMemberModalProps {
    users: User[];
    currentParticipants: User[];
    onAddMembers: (selectedUsers: User[]) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
    users,
    currentParticipants,
    onAddMembers,
    open,
    onOpenChange,
}) => {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const participantIds = new Set(currentParticipants.map(p => p.id));

    const filteredUsers = users.filter(
        (user) =>
            !participantIds.has(user.id) &&
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

    const handleConfirm = () => {
        if (selectedUsers.length > 0) {
            onAddMembers(selectedUsers);
            onOpenChange(false);
            setSelectedUsers([]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-wa-bg border-border text-wa-text">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus size={20} className="text-wa-primary" />
                        Ajouter des membres
                    </DialogTitle>
                    <DialogDescription className="text-wa-text-secondary">
                        Sélectionnez les personnes à ajouter au groupe.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-wa-panel/30 rounded-lg">
                            {selectedUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-1 bg-wa-primary/10 text-wa-primary rounded-full pl-1 pr-2 py-1 border border-wa-primary/20"
                                >
                                    <Avatar
                                        src={user.photo}
                                        alt={user.name}
                                        className="w-6 h-6"
                                    />
                                    <span className="text-xs font-medium">{user.name}</span>
                                    <button
                                        onClick={() => handleRemoveUser(user.id)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-wa-secondary" size={18} />
                        <Input
                            id="participants"
                            placeholder="Rechercher des utilisateurs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-wa-panel border-border focus:ring-wa-primary"
                            autoComplete="off"
                        />

                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded-xl max-h-60 overflow-y-auto bg-wa-panel shadow-2xl animate-in fade-in slide-in-from-top-2">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-3 flex items-center gap-3 hover:bg-wa-bg/50 cursor-pointer transition-colors"
                                            onClick={() => handleAddUser(user)}
                                        >
                                            <Avatar
                                                src={user.photo}
                                                alt={user.name}
                                                status={user.status}
                                            />
                                            <div className="flex-1">
                                                <div className="text-[14px] font-semibold">{user.name}</div>
                                                <div className="text-[12px] text-wa-text-secondary capitalize">
                                                    {user.role}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-wa-text-secondary text-sm">
                                        Aucun utilisateur trouvé
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-wa-text">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={selectedUsers.length === 0}
                        className="bg-wa-primary text-white hover:bg-wa-primary/90"
                    >
                        Ajouter ({selectedUsers.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddMemberModal;
