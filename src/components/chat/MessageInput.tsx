
import React, { useState, FormEvent } from "react";
import { Paperclip, X, Send, Mic, Plus, Smile, Camera, Image, Video, MapPin, StickyNote, FileText, User as UserIcon, Headset } from "lucide-react";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  replyTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-4 py-3 bg-wa-bg transition-colors relative z-10"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      {replyTo && (
        <div className="mb-2 bg-wa-panel rounded-lg p-2.5 flex items-start justify-between border-l-4 border-wa-primary shadow-sm">
          <div className="flex-1">
            <div className="text-[13px] text-wa-primary font-semibold">Répondre à</div>
            <div className="text-[14px] text-wa-text-secondary truncate">{replyTo.content}</div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="ml-2 text-wa-secondary hover:text-wa-text"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="bg-wa-panel text-wa-text rounded-full px-4 py-1.5 text-xs flex items-center shadow-sm"
            >
              <span className="truncate max-w-[150px] font-medium">{file.name}</span>
              <button
                type="button"
                className="ml-2 text-wa-secondary hover:text-red-400"
                onClick={() => removeAttachment(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && (
        <div className="mb-3 flex items-center justify-between px-2 overflow-x-auto no-scrollbar gap-2">
          <ShortcutIcon icon={UserIcon} label="Contact" color="#7B61FF" />
          <ShortcutIcon icon={Headset} label="Audio" color="#00d2ff" onClick={handlePlusClick} />
          <ShortcutIcon icon={Image} label="Galery" color="#4CAF50" onClick={handlePlusClick} />
          <ShortcutIcon icon={Video} label="Video" color="#00C853" onClick={handlePlusClick} />
          <ShortcutIcon icon={MapPin} label="Localis." color="#00BCD4" />
          <ShortcutIcon icon={StickyNote} label="Stickers" color="#FF9800" />
          <ShortcutIcon icon={FileText} label="Docum." color="#2196F3" onClick={handlePlusClick} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button type="button" className="p-2 text-wa-secondary hover:text-wa-primary transition-colors">
          <Smile size={26} />
        </button>

        <div className="flex-1 relative flex items-center bg-wa-panel rounded-full px-4 py-1 border border-border/50">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "Hors ligne..." : "Message"}
            disabled={disabled}
            className="flex-1 py-2 bg-transparent outline-none text-[15px] text-wa-text placeholder-wa-secondary transition-all"
          />
          <button type="button" onClick={handlePlusClick} className="p-1.5 text-wa-secondary hover:text-wa-primary transition-colors">
            <Camera size={22} />
          </button>
        </div>

        {message.trim() || attachments.length > 0 ? (
          <button
            type="submit"
            disabled={disabled}
            className="p-3 bg-wa-primary text-white rounded-full disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center ml-1"
          >
            <Send size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            className="p-3 text-wa-secondary hover:text-wa-primary transition-colors"
          >
            <Mic size={26} />
          </button>
        )}
      </div>
    </form>
  );
};

const ShortcutIcon = ({ icon: Icon, label, color, onClick }: any) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 min-w-[56px] cursor-pointer group"
  >
    <div
      style={{ backgroundColor: `${color}15`, color: color }}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
    >
      <Icon size={20} />
    </div>
    <span className="text-[10px] text-wa-text-secondary font-medium">{label}</span>
  </div>
);

export default MessageInput;
