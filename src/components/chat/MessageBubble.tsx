
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import { Message, User } from "@/types/chat";
import { Clock, Paperclip } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, sender }) => {
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

  return (
    <div
      className={cn(
        "flex mb-4 animate-fade-in",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && sender && (
        <div className="flex-shrink-0 mr-2 self-end mb-1">
          <Avatar src={sender.photo} alt={sender.name} size="sm" />
        </div>
      )}
      
      <div className={cn("max-w-[70%]", isCurrentUser ? "items-end" : "items-start")}>
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
