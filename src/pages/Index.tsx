
import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/chat/ThemeToggle";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import { Conversation, Message, User } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import io, { Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    } else {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/users/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data.users)) {
            setUsers(result.data.users);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === "success" && Array.isArray(result.data.conversations)) {
            const fetchedConversations: Conversation[] = result.data.conversations.map((conv: any) => ({
              id: conv.id,
              type: conv.type,
              name: conv.type === 'group' ? conv.name : conv.participants.find((p: any) => p.id !== currentUser.id)?.name || 'Unknown User',
              participants: conv.participants.map((p: any) => ({
                id: p.id,
                name: p.name,
                photo: p.photo ? `${API_URL}/${p.photo}` : '',
                role: p.role,
                status: p.status,
              })),
              messages: [], // Messages will be fetched on selection
              unreadCount: conv.unreadCount || 0,
              avatar: conv.type === 'group' ? (conv.avatar ? `${API_URL}/${conv.avatar}` : '') : (conv.participants.find((p: any) => p.id !== currentUser.id)?.photo ? `${API_URL}/${conv.participants.find((p: any) => p.id !== currentUser.id)?.photo}` : ''),
              lastMessage: conv.lastMessage ? {
                id: conv.lastMessage.id,
                content: conv.lastMessage.content,
                senderId: conv.lastMessage.senderId,
                timestamp: `${conv.lastMessage.sentDate}T${conv.lastMessage.sentTime}`,
                status: 'sent',
                attachments: []
              } : undefined,
            }));
            setConversations(fetchedConversations);
            if (!isMobile && fetchedConversations.length > 0) {
              setSelectedConversationId(fetchedConversations[0].id);
            }
          }
        } else {
          console.error("Failed to fetch conversations:", response.statusText);
          toast({ title: "Erreur", description: "Impossible de charger les conversations.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast({ title: "Erreur", description: "Erreur réseau lors du chargement des conversations.", variant: "destructive" });
      }
    };

    fetchConversations();
  }, [currentUser, navigate, toast, isMobile]);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !currentUser) return;

    const newSocket = io(API_URL, {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server", newSocket.id);
      setIsConnected(true);
      newSocket.emit("connected", {
        userId: currentUser.id,
        message: "Page Loaded",
      });
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("server_message", (data) => {
      console.log("Message from server: ", data);
      toast({
        title: data.title,
        description: data.message,
        variant: data.variant,
      });
    });

    newSocket.on("privateMessage", (data) => {
      console.log("New private message:", data);

      // Show notification with sender name
      toast({
        title: `Nouveau message de ${data.senderName || 'Un utilisateur'}`,
        description: data.content,
      });

      // Add message to conversation in real-time
      const messageToAdd: Message = {
        id: data.id || `msg-${Date.now()}`,
        content: data.content,
        senderId: data.senderId,
        timestamp: `${data.sentDate}T${data.sentTime}`,
        status: 'sent',
        attachments: data.attachment ? [{
          id: `att-${data.id}`,
          name: "Piece jointe",
          url: `${API_URL}/${data.attachment}`,
          type: data.attachmentType || 'document',
          size: '?'
        }] : []
      };

      // Update conversations state
      setConversations(prev => prev.map(conv => {
        // Find the conversation with this user
        if (conv.type === 'user' && conv.participants.some(p => p.id === data.senderId)) {
          // Check if message already exists (deduplication)
          const messageExists = conv.messages.some(m => m.id === messageToAdd.id);
          if (!messageExists) {
            return {
              ...conv,
              messages: [...conv.messages, messageToAdd],
              lastMessage: messageToAdd,
              unreadCount: selectedConversationId === conv.id ? 0 : (conv.unreadCount || 0) + 1
            };
          }
        }
        return conv;
      }));
    });

    newSocket.on("groupMessage", (data) => {
      console.log("New group message:", data);

      // Show notification with sender name and group context
      toast({
        title: `Nouveau message de ${data.senderName || 'Un membre'} dans le groupe`,
        description: data.content,
      });

      // Add message to group conversation in real-time
      const messageToAdd: Message = {
        id: data.id || `msg-${Date.now()}`,
        content: data.content,
        senderId: data.senderId,
        timestamp: `${data.sentDate}T${data.sentTime}`,
        status: 'sent',
        attachments: data.attachment ? [{
          id: `att-${data.id}`,
          name: "Piece jointe",
          url: `${API_URL}/${data.attachment}`,
          type: data.attachmentType || 'document',
          size: '?'
        }] : []
      };

      // Update conversations state
      setConversations(prev => prev.map(conv => {
        // Find the group conversation
        if (conv.type === 'group' && conv.id === data.groupId) {
          // Check if message already exists (deduplication)
          const messageExists = conv.messages.some(m => m.id === messageToAdd.id);
          if (!messageExists) {
            return {
              ...conv,
              messages: [...conv.messages, messageToAdd],
              lastMessage: messageToAdd,
              unreadCount: selectedConversationId === conv.id ? 0 : (conv.unreadCount || 0) + 1
            };
          }
        }
        return conv;
      }));
    });

    newSocket.on("userStatus", (data) => {
      if (data.status === "online" && data.userId !== currentUser.id) {
        toast({
          title: "Nouvelle connexion",
          description: data.message || "Un utilisateur est en ligne",
          variant: "default",
        });
      }
    });

    newSocket.on("groupCreated", (data) => {
      console.log("New group created:", data);

      // Add the new group to conversations list
      const newGroup: Conversation = {
        id: data.group.id,
        type: "group",
        name: data.group.name,
        participants: data.group.Users.map((u: any) => ({
          id: u.id,
          name: u.name,
          photo: u.photo ? `${API_URL}/${u.photo}` : '',
          role: u.role,
          status: u.status,
        })),
        messages: [],
        unreadCount: 0,
        avatar: data.group.avatar ? `${API_URL}/${data.group.avatar}` : '',
      };

      // Check if group already exists (avoid duplicates)
      setConversations(prev => {
        const exists = prev.some(c => c.id === newGroup.id);
        if (!exists) {
          toast({
            title: "Nouveau groupe",
            description: `Vous avez été ajouté au groupe "${newGroup.name}"`,
          });
          return [...prev, newGroup];
        }
        return prev;
      });

      // Join the group socket room
      newSocket.emit('joinGroup', data.group.id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [toast, currentUser]);


  useEffect(() => {
    if (isMobile) {
      if (conversations.length > 0 && !selectedConversationId) {
        // Don't auto-select on mobile to show list first
      }
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile, conversations.length, selectedConversationId]);

  // Handle selecting a conversation
  const handleSelectConversation = async (id: string) => {
    setSelectedConversationId(id);

    // Fetch full details
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const endpoint = conversation.type === 'group'
      ? `${API_URL}/api/messages/group/${id}`
      : `${API_URL}/api/messages/user/${id}`;

    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        const messages = result.data.messages.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          timestamp: `${m.sentDate}T${m.sentTime}`,
          status: 'sent',
          attachments: m.attachment ? [{
            id: `att-${m.id}`,
            name: "Piece jointe",
            url: `${API_URL}/${m.attachment}`,
            type: m.attachmentType || 'document',
            size: '?'
          }] : []
        }));

        // Update conversation with real messages and members
        setConversations(prev => prev.map(c => {
          if (c.id !== id) return c;
          return {
            ...c,
            messages: messages,
            participants: conversation.type === 'group' && result.data.group?.members
              ? result.data.group.members.map((p: any) => ({
                id: p.id,
                name: p.name,
                photo: p.photo ? `${API_URL}/${p.photo}` : '',
                role: p.role,
                status: p.status,
              }))
              : c.participants,
            unreadCount: 0
          };
        }));

        // Join group socket room if this is a group conversation
        if (conversation.type === 'group' && socket) {
          socket.emit('joinGroup', id);
          console.log(`Joined group room: ${id}`);
        }
      }
    } catch (e) {
      console.error("Failed to fetch details", e);
    }
  };

  // Handle sending a message
  // Handle sending a message
  const handleSendMessage = async (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => {
    if (!currentUser) return;

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // 1. Create FormData for file upload support (if needed, though current controller uses json body for text usually, but has upload.single('attachment'))
    // The backend route uses upload.single('attachment'), so we should use FormData.
    const formData = new FormData();
    formData.append('content', content);
    formData.append('type', conversation.type);
    if (conversation.type === 'group') {
      formData.append('recipientId', conversation.id);
    } else {
      const partner = conversation.participants.find(p => p.id !== currentUser.id);
      if (partner) formData.append('recipientId', partner.id);
    }

    if (attachments && attachments.length > 0) {
      formData.append('attachment', attachments[0]); // Backend seems to handle single file 'attachment'
    }

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type header is set automatically with FormData
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const savedMessage = result.data.message;

        // Map backend message to frontend format
        const newMessage: Message = {
          id: savedMessage.id,
          content: savedMessage.content,
          senderId: savedMessage.senderId,
          timestamp: `${savedMessage.sentDate}T${savedMessage.sentTime}`,
          status: 'sent',
          attachments: savedMessage.attachment ? [{
            id: `att-${savedMessage.id}`,
            name: "Piece jointe",
            url: `${API_URL}/${savedMessage.attachment}`,
            type: savedMessage.attachmentType || 'document',
            size: '?'
          }] : []
        };

        // Update UI
        setConversations(prev => prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: newMessage }
            : conv
        ));

        // Emit socket for real-time to others (if backend doesn't broadcast on API call)
        if (socket) {
          const eventName = conversation.type === 'group' ? 'groupMessage' : 'privateMessage';
          const payload = {
            ...savedMessage,
            senderId: currentUser.id,
            // Add necessary fields for the receiver to understand context
            ...(conversation.type === 'group' ? { groupId: conversation.id } : { recipientId: conversation.participants.find(p => p.id !== currentUser.id)?.id })
          };
          socket.emit(eventName, payload);
        }

      } else {
        console.error("Failed to send message", response.status);
        toast({ title: "Erreur", description: "Échec de l'envoi du message", variant: "destructive" });
      }
    } catch (e) {
      console.error("Error sending message", e);
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" });
    }
  };

  // Handle creating a new group
  const handleCreateGroup = async (name: string, participants: User[]) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          members: participants.map(p => p.id)
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Group creation response:', result);

        // Extract the real group ID from the backend response
        const groupId = result.data?.group?.id;

        if (!groupId) {
          console.error('No group ID in response:', result);
          toast({ title: "Erreur", description: "ID de groupe manquant dans la réponse", variant: "destructive" });
          return;
        }

        // Add to local state with the real group ID
        const newGroup: Conversation = {
          id: groupId,  // Use the real ID from backend
          type: "group",
          name: name,
          participants: [...participants, currentUser].map(p => ({
            ...p,
            photo: p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}/${p.photo}`) : ''
          })),
          messages: [],
          unreadCount: 0,
          avatar: "",
        };
        setConversations([...conversations, newGroup]);
        setSelectedConversationId(newGroup.id);

        // Join the group socket room immediately
        if (socket) {
          socket.emit('joinGroup', groupId);
          console.log(`Joined group room: ${groupId}`);
        }

        toast({ title: "Groupe créé", description: `Le groupe "${name}" a été créé.` });
      } else {
        toast({ title: "Erreur", description: "Impossible de créer le groupe", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" });
    }
  };

  // Handle starting a direct message conversation
  const handleStartConversation = (userId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      (conv) =>
        conv.type === "user" &&
        conv.participants.some((p) => p.id === userId)
    );

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      return;
    }

    // Create new conversation
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    // Note: In a real app we might not have an ID yet if we haven't talked before, 
    // but the backend `getAllConversations` typically returns existing ones.
    // If we start a fresh chat, we might just navigate or optimistically add it.
    // For now let's optimistically add it.
    const newConvId = `temp-${Date.now()}`;
    const newConversation: Conversation = {
      id: newConvId,
      type: "user",
      name: user.name,
      participants: [user],
      messages: [],
      unreadCount: 0,
      avatar: user.photo,
    };

    setConversations([...conversations, newConversation]);
    setSelectedConversationId(newConvId);
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
        currentUser={currentUser || { id: "temp", name: "Chargement...", photo: "", role: "student", status: "offline" }}
        isConnected={isConnected}
        onSelectConversation={handleSelectConversation}
        selectedConversationId={selectedConversationId}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        onCreateGroup={handleCreateGroup}
        onStartConversation={handleStartConversation}
      />

      <div className="flex flex-col flex-1">
        <ChatArea
          conversation={selectedConversation}
          currentUser={currentUser || { id: "temp", name: "Chargement...", photo: "", role: "student", status: "offline" }}
          users={users}
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          onToggleSidebar={toggleSidebar}
        />

        <div className="hidden">
          {/* Modals are manipulated by Sidebar via callbacks now */}
        </div>
      </div>

      <ThemeToggle />
    </div>
  );
};

export default Index;
