
import React, { useState, FormEvent } from "react";
import { Paperclip } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

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
      className="border-t border-gray-200 px-4 py-3 bg-white"
    >
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded px-3 py-1 text-sm flex items-center"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                className="ml-2 text-ecole-meta hover:text-ecole-offline"
                onClick={() => removeAttachment(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center">
        <label className="flex-shrink-0 cursor-pointer text-ecole-meta hover:text-ecole-primary mr-2">
          <Paperclip size={20} />
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? "Hors ligne - Messages en attente" : "Écrivez un message..."}
          disabled={disabled}
          className="flex-1 py-2 px-3 bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-ecole-primary text-ecole-text placeholder-ecole-meta"
        />

        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className="ml-2 px-4 py-2 bg-ecole-accent text-ecole-text font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ecole-accent/90 transition-colors"
        >
          Envoyer
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
