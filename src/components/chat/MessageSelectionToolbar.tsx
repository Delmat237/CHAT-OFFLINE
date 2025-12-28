
import React from "react";
import { X, Forward, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageSelectionToolbarProps {
    selectedCount: number;
    onForward: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onCancel: () => void;
}

const MessageSelectionToolbar: React.FC<MessageSelectionToolbarProps> = ({
    selectedCount,
    onForward,
    onDelete,
    onCopy,
    onCancel,
}) => {
    return (
        <div className="fixed top-0 left-0 right-0 bg-ecole-primary text-white z-50 px-4 py-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-white hover:bg-white/20"
                >
                    <X className="h-5 w-5" />
                </Button>
                <span className="font-medium">{selectedCount} sélectionné(s)</span>
            </div>

            <div className="flex items-center gap-2">
                {selectedCount === 1 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCopy}
                        className="text-white hover:bg-white/20"
                        title="Copier"
                    >
                        <Copy className="h-5 w-5" />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onForward}
                    className="text-white hover:bg-white/20"
                    title="Transférer"
                >
                    <Forward className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    className="text-white hover:bg-white/20"
                    title="Supprimer"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default MessageSelectionToolbar;
