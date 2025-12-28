
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
                <div key={attachment.id} className="mb-2">
                  {attachment.type.startsWith('image/') ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 max-w-sm">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-auto object-cover max-h-64 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                      <div className="p-2 text-xs flex items-center justify-between text-ecole-meta bg-white">
                        <span className="truncate flex-1">{attachment.name}</span>
                        <a href={attachment.url} download={attachment.name} className="ml-2 hover:text-ecole-primary">
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "p-3 rounded-lg flex items-center hover:opacity-90 transition-opacity",
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
                    </a>
                  )}
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
              {/* Forwarded indicator */}
              {message.isForwarded && (
                <div className="flex items-center gap-1 text-xs text-gray-500 italic mb-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span>Transféré</span>
                </div>
              )}

              {/* Reply quote */}
              {message.replyTo && (
                <div className={cn(
                  "mb-2 pl-2 border-l-4 py-1 rounded",
                  isCurrentUser ? "border-blue-600 bg-blue-50/50" : "border-green-600 bg-green-50/50"
                )}>
                  <div className="text-xs font-semibold text-gray-700">
                    {message.replyTo.senderName}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {message.replyTo.content}
                  </div>
                </div>
              )}

              <div className={cn(
                "whitespace-pre-line",
                message.isForwarded && "text-sm"
              )}>
                {message.content || ""}
              </div>
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
