
import React, { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Conversation, Message, User, Attachment } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface ChatAreaProps {
  conversation: Conversation | null;
  currentUser: User;
  users: User[];
  isConnected: boolean;
  onSendMessage: (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => void;
  onToggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  currentUser,
  users,
  isConnected,
  onSendMessage,
  onToggleSidebar,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const getSender = (senderId: string): User | undefined => {
    if (senderId === currentUser.id) {
      return currentUser;
    }
    return users.find((user) => user.id === senderId);
  };

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (conversation) {
      onSendMessage(conversation.id, content, attachments);
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
      <ChatHeader 
        conversation={conversation} 
        isConnected={isConnected} 
        onToggleSidebar={onToggleSidebar}
        onInitiateCall={handleInitiateCall}
      />
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 messages-container">
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
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected}
      />
    </div>
  );
};

export default ChatArea;
