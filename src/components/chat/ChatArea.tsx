
import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import MessageSelectionToolbar from "./MessageSelectionToolbar";
import ForwardMessageModal from "./ForwardMessageModal";
import { Conversation, Message, User } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface ChatAreaProps {
  conversation: Conversation | null;
  currentUser: User;
  users: User[];
  conversations: Conversation[];
  isConnected: boolean;
  onSendMessage: (
    conversationId: string,
    content: string,
    attachments?: File[],
    isForwarded?: boolean,
    replyTo?: { id: string; content: string; senderId: string; senderName: string }
  ) => void;
  onToggleSidebar: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onClose?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  currentUser,
  users,
  conversations,
  isConnected,
  onSendMessage,
  onToggleSidebar,
  onDeleteMessage,
  onClose
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Message selection state
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Reset selection when conversation changes
  useEffect(() => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
    setReplyToMessage(null);
  }, [conversation?.id]);

  const getSender = (senderId: string): User | undefined => {
    if (senderId === currentUser.id) {
      return currentUser;
    }
    return users.find((user) => user.id === senderId);
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (conversation) {
      const replyInfo = replyToMessage ? {
        id: replyToMessage.id,
        content: replyToMessage.content,
        senderId: replyToMessage.senderId,
        senderName: getSender(replyToMessage.senderId)?.name || 'Unknown'
      } : undefined;

      onSendMessage(conversation.id, content, attachments, false, replyInfo);
      setReplyToMessage(null);
    }
  };

  const handleInitiateCall = () => {
    if (!isConnected) {
      toast({
        title: "Impossible de démarrer un appel",
        description: "Vous êtes hors ligne. Reconnectez-vous au réseau pour passer un appel.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Appel en cours",
      description: `Appel vers ${conversation?.name} en préparation...`,
    });
  };

  // Message selection handlers
  const handleSelectMessage = (messageId: string) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);

    // Enter selection mode if messages are selected
    if (newSelection.size > 0) {
      setIsSelectionMode(true);
    } else {
      setIsSelectionMode(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  const handleCopyMessage = (content: string) => {
    toast({
      title: "Copié",
      description: "Le message a été copié dans le presse-papiers",
    });
  };

  const handleCopySelected = () => {
    if (!conversation) return;

    const selectedMsgs = conversation.messages.filter(m => selectedMessages.has(m.id));
    const text = selectedMsgs.map(m => m.content).join('\n\n');
    navigator.clipboard.writeText(text);

    toast({
      title: "Copié",
      description: `${selectedMessages.size} message(s) copié(s)`,
    });
    handleCancelSelection();
  };

  const handleReply = (message: Message) => {
    setReplyToMessage(message);
    toast({
      title: "Répondre",
      description: "Répondez au message sélectionné",
    });
  };

  const handleForwardMessage = (message: Message) => {
    setSelectedMessages(new Set([message.id]));
    setIsForwardModalOpen(true);
  };

  const handleForwardSelected = () => {
    setIsForwardModalOpen(true);
  };

  const handleForward = (conversationId: string) => {
    if (!conversation) return;

    const selectedMsgs = conversation.messages.filter(m => selectedMessages.has(m.id));
    selectedMsgs.forEach(msg => {
      onSendMessage(conversationId, msg.content, undefined, true);
    });

    toast({
      title: "Transféré",
      description: `${selectedMessages.size} message(s) transféré(s)`,
    });
    handleCancelSelection();
  };

  const handleDeleteMessage = (messageId: string) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
      toast({
        title: "Supprimé",
        description: "Le message a été supprimé",
      });
    }
  };

  const handleDeleteSelected = () => {
    if (!onDeleteMessage) return;

    selectedMessages.forEach(messageId => {
      onDeleteMessage(messageId);
    });

    toast({
      title: "Supprimé",
      description: `${selectedMessages.size} message(s) supprimé(s)`,
    });
    handleCancelSelection();
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium">Bienvenue dans École Chat</div>
          <p className="mt-2">Sélectionnez une conversation pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {isSelectionMode && (
        <MessageSelectionToolbar
          selectedCount={selectedMessages.size}
          onForward={handleForwardSelected}
          onDelete={handleDeleteSelected}
          onCopy={handleCopySelected}
          onCancel={handleCancelSelection}
        />
      )}

      <ChatHeader
        conversation={conversation}
        isConnected={isConnected}
        onToggleSidebar={onToggleSidebar}
        onInitiateCall={handleInitiateCall}
        onClose={onClose}
      />

      <div className={`flex-1 overflow-y-auto p-4 bg-gray-50 messages-container ${isSelectionMode ? 'pt-20' : ''}`}>
        {conversation.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-full">
            <div className="text-center text-ecole-meta">
              <p>Aucun message</p>
              <p className="text-sm mt-1">Commencez la conversation !</p>
            </div>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUser.id}
              sender={getSender(message.senderId)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedMessages.has(message.id)}
              onSelect={handleSelectMessage}
              onCopy={handleCopyMessage}
              onReply={handleReply}
              onForward={handleForwardMessage}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected}
        replyTo={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
      />

      <ForwardMessageModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        conversations={conversations.filter(c => c.id !== conversation.id)}
        onForward={handleForward}
      />
    </div>
  );
};

export default ChatArea;
