
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import MessageActions from "./MessageActions";
import { Message, User } from "@/types/chat";
import { Check, CheckCheck, Clock, Paperclip } from "lucide-react";
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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.(message.content);
  };

  return (
    <div
      className={cn(
        "flex mb-2 animate-fade-in group",
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
          <Avatar src={sender.photo} alt={sender.name} size="xs" />
        </div>
      )}

      <div className={cn(
        "max-w-[85%] relative px-2 py-1.5 rounded-lg shadow-sm group",
        isCurrentUser
          ? "bg-wa-message-out text-wa-text rounded-tr-none ml-12"
          : "bg-wa-message-in text-wa-text rounded-tl-none mr-12"
      )}>
        <div className={cn(
          "absolute top-0 w-3 h-4",
          isCurrentUser
            ? "right-[-8px] text-wa-message-out"
            : "left-[-8px] text-wa-message-in"
        )}>
          <svg viewBox="0 0 8 13" width="8" height="13">
            <path fill="currentColor" d={isCurrentUser ? "M1.533 3.568 8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568Z" : "M6.467 3.568 0 12.193V1h5.188c1.77 0 2.338 1.156 1.279 2.568Z"}></path>
          </svg>
        </div>

        {!isCurrentUser && sender && (
          <div className="text-[13px] font-semibold text-wa-primary mb-0.5 ml-0.5">{sender.name}</div>
        )}

        {/* Reply quote */}
        {message.replyTo && (
          <div className={cn(
            "mb-2 pl-2 border-l-4 py-1.5 rounded bg-black/5 dark:bg-black/20 text-xs",
            isCurrentUser ? "border-wa-primary" : "border-wa-primary"
          )}>
            <div className="font-semibold text-wa-primary mb-0.5">
              {message.replyTo.senderName}
            </div>
            <div className="text-wa-text-secondary truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-1">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="rounded overflow-hidden">
                {attachment.type.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full h-auto cursor-pointer"
                    onClick={() => window.open(attachment.url, '_blank')}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-black/10 rounded focus:outline-none">
                    <Paperclip size={16} className="text-wa-secondary" />
                    <span className="text-sm truncate flex-1">{attachment.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col">
          <div className="text-[14.5px] leading-relaxed break-words py-0.5">
            {message.content}
          </div>

          <div className="flex items-center gap-1 justify-end -mt-1 pb-0.5 self-end">
            <span className="text-[10px] text-wa-text-secondary opacity-70">
              {formatTime(message.timestamp)}
            </span>
            {isCurrentUser && (
              <div className="flex-shrink-0">
                {message.status === "pending" ? (
                  <Clock size={10} className="text-wa-secondary" />
                ) : (
                  <CheckCheck size={14} className="text-wa-check-blue" strokeWidth={3} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Actions Popup trigger on hover */}
        {!isSelectionMode && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MessageActions
              messageId={message.id}
              messageContent={message.content}
              isCurrentUser={isCurrentUser}
              onCopy={handleCopy}
              onReply={() => onReply?.(message)}
              onForward={() => onForward?.(message)}
              onDelete={() => onDelete?.(message.id)}
              onSelect={() => onSelect?.(message.id)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
