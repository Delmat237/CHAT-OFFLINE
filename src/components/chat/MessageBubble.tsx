
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import MessageActions from "./MessageActions";
import { Message, User } from "@/types/chat";
import { Clock, Paperclip } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  sender,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
  onCopy,
  onReply,
  onForward,
  onDelete,
}) => {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  };

  const formatTimeSince = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: fr,
      });
    } catch (error) {
      return "";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
  };

  return (
    <div
      className={cn(
        "flex mb-4 animate-fade-in group",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {isSelectionMode && (
        <div className="flex items-center mr-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect?.(message.id)}
          />
        </div>
      )}

      {!isCurrentUser && sender && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <Avatar src={sender.photo} alt={sender.name} size="sm" />
        </div>
      )}

      <div className={cn("max-w-[70%] relative", isCurrentUser ? "items-end" : "items-start")}>
        {!isCurrentUser && sender && (
          <div className="text-xs text-ecole-meta mb-1 ml-1">{sender.name}</div>
        )}

        <div className="flex flex-col">
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "p-3 rounded-lg flex items-center mb-1",
                    isCurrentUser
                      ? "bg-ecole-primary text-white"
                      : "bg-gray-100 text-ecole-text"
                  )}
                >
                  <Paperclip size={16} className="mr-2" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    <div className="text-xs opacity-80">{attachment.size}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <div
              className={cn(
                "p-3 rounded-lg shadow-sm",
                isCurrentUser
                  ? "bg-ecole-userMessage text-ecole-text rounded-br-none"
                  : "bg-ecole-otherMessage text-ecole-text rounded-bl-none"
              )}
            >
              <div className="whitespace-pre-line">{message.content}</div>
            </div>

            {!isSelectionMode && (
              <div className={cn(
                "absolute top-2",
                isCurrentUser ? "left-2" : "right-2"
              )}>
                <MessageActions
                  messageId={message.id}
                  messageContent={message.content}
                  isCurrentUser={isCurrentUser}
                  onCopy={handleCopy}
                  onReply={() => onReply?.(message)}
                  onForward={() => onForward?.(message)}
                  onDelete={() => onDelete?.(message.id)}
                  onSelect={() => onSelect?.(message.id)}
                />
              </div>
            )}
          </div>

          <div
            className={cn(
              "text-xs text-ecole-meta mt-1 flex items-center",
              isCurrentUser ? "justify-end" : "justify-start"
            )}
          >
            {formatTime(message.timestamp)}
            {isCurrentUser && message.status === "pending" && (
              <Clock size={12} className="ml-1 text-ecole-offline" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
