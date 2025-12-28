
import React from "react";
import { MoreVertical, Copy, Reply, Forward, Trash2, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
    messageId: string;
    messageContent: string;
    isCurrentUser: boolean;
    onCopy: () => void;
    onReply: () => void;
    onForward: () => void;
    onDelete: () => void;
    onSelect: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
    messageContent,
    isCurrentUser,
    onCopy,
    onReply,
    onForward,
    onDelete,
    onSelect,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onSelect}>
                    <Check className="mr-2 h-4 w-4" />
                    Sélectionner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReply}>
                    <Reply className="mr-2 h-4 w-4" />
                    Répondre
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onForward}>
                    <Forward className="mr-2 h-4 w-4" />
                    Transférer
                </DropdownMenuItem>
                {isCurrentUser && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default MessageActions;
