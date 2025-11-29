
import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/chat/ThemeToggle";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import {  mockConversations, currentUser, userState } from "@/data/mockData";
import { Conversation, Message, User } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import CreateGroupModal from "@/components/chat/CreateGroupModal";
import CreateDirectMessageModal from "@/components/chat/CreateDirectMessageModal";
import io from "socket.io-client";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(userState.isConnected);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://192.168.8.110:3000/api/users/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        

        const result = await response.json();
        if (result.status === "success") {
          setUsers(result.data.users);
        } else {
          console.error("Échec de la récupération des utilisateurs");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      }
    };

    fetchUsers();
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token"); // Remplace par le nom exact si différent

    if (!token) return;

    const socket = io("http://192.168.8.110:3000", {
      auth: {
        token: token,
      },
    });

    socket.emit("connected", {
      userId: currentUser.id,
      message: "Page Loaded",
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server", socket.id);
    });
    socket.on("server_message", (data) => {
      console.log("Message from server: ", data);
      toast({
        title: data.title,
        description: data.message,
        variant: data.variant,
      });
    });

    socket.on("userStatus", (data) => {
      if (data.status === "online" && data.userId !== currentUser.id) {
        toast({
          title: "Nouvelle connexion",
          description: data.message || "Un utilisateur est en ligne",
          variant: "default", // ou "success"
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, currentUser.id]);

  
  useEffect(() => {

    if (isMobile) {
      // On mobile, show chat area by default if conversation exists
      if (conversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(conversations[0].id);
      }
      // Close sidebar by default on mobile
      setIsSidebarOpen(false); 
    } else {
      // On desktop, keep sidebar open by default
      setIsSidebarOpen(true);
    }
    // Simulate connection status changes
    const interval = setInterval(() => {
      const newStatus = Math.random() > 0.7;
      setIsConnected(newStatus);
      
      if (!userState.isConnected && newStatus) {
        toast({
          title: "Connexion rétablie",
          description: "Vous êtes maintenant connecté au réseau local.",
          variant: "default",
        });
      } else if (userState.isConnected && !newStatus) {
        toast({
          title: "Connexion perdue",
          description: "Vous êtes maintenant en mode hors ligne.",
          variant: "destructive",
        });
      }
      
      userState.isConnected = newStatus;
    }, 20000); // Check every 20 seconds
    
    return () => clearInterval(interval);
  }, [toast]);

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    
    // Mark as read when selecting
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  // Handle sending a message
  const handleSendMessage = (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => {
    const now = new Date();
    const newMessage: Message = {
      id: `msg-${conversationId}-${now.getTime()}`,
      content,
      senderId: currentUser.id,
      timestamp: now.toISOString(),
      status: isConnected ? "sent" : "pending",
      attachments: attachments
        ? attachments.map((file, index) => ({
            id: `attach-${now.getTime()}-${index}`,
            name: file.name,
            type: file.type.startsWith("image/")
              ? "image"
              : file.type.startsWith("application/")
                ? "document"
                : "other",
            url: "#",
            size: `${Math.round(file.size / 1024)} KB`,
          }))
        : undefined,
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: newMessage,
            }
          : conv
      )
    );

    if (!isConnected) {
      toast({
        title: "Message en attente",
        description: "Votre message sera envoyé automatiquement lorsque la connexion sera rétablie.",
        variant: "default",
      });
    }
  };
  
  // Handle creating a new group
  const handleCreateGroup = (name: string, participants: User[]) => {
    const now = new Date();
    const newGroupId = `c${conversations.length + 1}`;
    
    const newGroup: Conversation = {
      id: newGroupId,
      type: "group",
      name: name,
      participants: participants,
      messages: [],
      unreadCount: 0,
      avatar: "",
    };
    
    setConversations([...conversations, newGroup]);
    setSelectedConversationId(newGroupId);
    
    toast({
      title: "Groupe créé",
      description: `Le groupe "${name}" a été créé avec ${participants.length} participant(s).`,
    });
  };
  
  // Handle starting a direct message conversation
  const handleStartConversation = (userId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      (conv) => 
        conv.type === "private" && 
        conv.participants.some((p) => p.id === userId)
    );
    
    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      return;
    }
    
    // Create new conversation
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    
    const newConvId = `c${conversations.length + 1}`;
    const newConversation: Conversation = {
      id: newConvId,
      type: "private",
      name: user.name,
      participants: [user],
      messages: [],
      unreadCount: 0,
      avatar: user.photo,
    };
    
    setConversations([...conversations, newConversation]);
    setSelectedConversationId(newConvId);
    
    toast({
      title: "Nouvelle conversation",
      description: `Conversation démarrée avec ${user.name}.`,
    });
  };

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  ) || null;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        users={users}
        conversations={conversations}
        currentUser={currentUser}
        isConnected={isConnected}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversationId}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-col flex-1">
        <ChatArea
          conversation={selectedConversation}
          currentUser={currentUser}
          users={users}
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="hidden">
          <CreateGroupModal 
            users={users}
            currentUser={currentUser}
            onCreateGroup={handleCreateGroup}
          />
          <CreateDirectMessageModal
            users={users}
            currentUser={currentUser}
            onStartConversation={handleStartConversation}
          />
        </div>
      </div>
      
      <ThemeToggle />
    </div>
  );
};

export default Index;
