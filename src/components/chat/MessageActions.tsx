
import React from "react";
import { MoreVertical, Copy, Reply, Forward, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
    compact?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
    messageContent,
    isCurrentUser,
    onCopy,
    onReply,
    onForward,
    onDelete,
    onSelect,
    compact = false,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-8 w-8 p-0 transition-opacity",
                        compact ? "opacity-40 hover:opacity-100 hover:bg-black/20" : "opacity-0 group-hover:opacity-100"
                    )}
                >
                    <MoreVertical className={cn("h-4 w-4", compact ? "text-gray-400" : "")} />
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
