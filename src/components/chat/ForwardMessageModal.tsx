
import React, { useState } from "react";
import { Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/chat";
import Avatar from "./Avatar";

interface ForwardMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    onForward: (conversationId: string) => void;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
    isOpen,
    onClose,
    conversations,
    onForward,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleForward = () => {
        if (selectedConversation) {
            onForward(selectedConversation);
            onClose();
            setSelectedConversation(null);
            setSearchQuery("");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Transférer le message</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher une conversation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {filteredConversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === conv.id
                                        ? "bg-ecole-primary/10 border-2 border-ecole-primary"
                                        : "hover:bg-gray-100"
                                    }`}
                            >
                                <Avatar
                                    src={conv.avatar}
                                    alt={conv.name}
                                    size="sm"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{conv.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {conv.type === "group" ? "Groupe" : "Contact direct"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleForward}
                            disabled={!selectedConversation}
                            className="bg-ecole-primary hover:bg-ecole-primary/90"
                        >
                            Transférer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ForwardMessageModal;
