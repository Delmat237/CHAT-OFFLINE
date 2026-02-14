
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import SideDrawer from "@/components/chat/SideDrawer";
import { Conversation, Message, User } from "@/types/chat";
import SettingsView from "@/components/chat/SettingsView";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import io, { Socket } from "socket.io-client";
import { API_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import { Menu, Search, MessageSquare, Users, Radio, Phone, User as UserIcon, Edit2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateDM, setShowCreateDM] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"contacts" | "talks" | "chats" | "stories" | "appels">("chats");
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
            const processedUsers = result.data.users.map((u: any) => ({
              ...u,
              role: u.role || "student",
              status: u.status || "offline",
              photo: u.photo ? (u.photo.startsWith('http') ? u.photo : `${API_URL}/uploads/${u.photo}`) : `${API_URL}/default.jpg`
            }));
            setUsers(processedUsers);
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
              name: conv.type === 'group'
                ? conv.name
                : (conv.participants.find((p: any) => String(p.id) !== String(currentUser.id))?.name || currentUser.name || 'Unknown User'),
              participants: conv.participants.map((p: any) => ({
                id: p.id,
                name: p.name,
                photo: p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}/uploads/${p.photo}`) : `${API_URL}/default.jpg`,
                role: p.role || "student",
                status: p.status || "offline",
              })),
              messages: [], // Messages will be fetched on selection
              unreadCount: conv.unreadCount || 0,
              avatar: conv.type === 'group'
                ? (conv.avatar ? (conv.avatar.startsWith('http') ? conv.avatar : `${API_URL}/uploads/${conv.avatar}`) : `${API_URL}/group.png`)
                : (() => {
                  const otherParticipant = conv.participants.find((p: any) => String(p.id) !== String(currentUser.id));
                  const photo = otherParticipant?.photo;
                  return photo ? (photo.startsWith('http') ? photo : `${API_URL}/uploads/${photo}`) : `${API_URL}/default.jpg`;
                })(),
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
          name: data.attachment.split('-').slice(2).join('-') || "Pièce jointe",
          url: `${API_URL}/uploads/${data.attachment}`,
          type: data.attachmentType || 'document',
          size: '?'
        }] : [],
        isForwarded: data.isForwarded,
        replyTo: data.replyTo
      };

      // Update conversations state
      setConversations(prev => prev.map(conv => {
        // Find the conversation with this user
        if (conv.type === 'user' && conv.participants.some(p => String(p.id) === String(data.senderId))) {
          // Check if message already exists (robust deduplication with string casting)
          const messageIdStr = String(messageToAdd.id);
          const messageExists = conv.messages.some(m => String(m.id) === messageIdStr);
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
        }] : [],
        isForwarded: data.isForwarded,
        replyTo: data.replyTo
      };

      // Update conversations state
      setConversations(prev => prev.map(conv => {
        // Find the group conversation
        if (conv.type === 'group' && String(conv.id) === String(data.groupId)) {
          // Check if message already exists (robust deduplication)
          const messageIdStr = String(messageToAdd.id);
          const messageExists = conv.messages.some(m => String(m.id) === messageIdStr);
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
          role: u.role || "student",
          status: u.status || "offline",
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

    newSocket.on("messageDeleted", (data) => {
      console.log("Message deleted:", data);
      setConversations(prev => prev.map(conv => {
        // Find relevant conversation (private or group)
        const isRelevant = (data.type === 'group' && conv.id === data.recipientId) ||
          (data.type === 'user' && (conv.id === data.senderId || conv.id === data.recipientId));

        if (isRelevant) {
          return {
            ...conv,
            messages: conv.messages.filter(m => String(m.id) !== String(data.messageId)),
            // If the last message was deleted, we should ideally update lastMessage too, 
            // but for now we just filter the list for simplicity in the UI.
          };
        }
        return conv;
      }));
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
    setShowSettings(false);

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
            url: `${API_URL}/uploads/${m.attachment}`,
            type: m.attachmentType || 'document',
            size: '?'
          }] : [],
          isForwarded: m.isForwarded,
          replyTo: m.replyTo
        }));

        // Update conversation with real messages and members
        setConversations(prev => prev.map(c => {
          if (String(c.id) !== String(id)) return c;

          let updatedName = c.name;
          let updatedAvatar = c.avatar;
          let updatedParticipants = c.participants;

          if (c.type === 'user' && result.data.user) {
            updatedName = result.data.user.name;
            const photo = result.data.user.photo;
            updatedAvatar = photo ? (photo.startsWith('http') ? photo : `${API_URL}/${photo}`) : `${API_URL}/default.jpg`;
            updatedParticipants = [{
              id: result.data.user.id,
              name: result.data.user.name,
              photo: updatedAvatar,
              role: result.data.user.role || "student",
              status: result.data.user.status || "offline",
              lastSeen: result.data.user.lastSeen
            }];
          } else if (c.type === 'group' && result.data.group?.members) {
            updatedParticipants = result.data.group.members.map((p: any) => ({
              id: p.id,
              name: p.name,
              photo: p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}/${p.photo}`) : `${API_URL}/default.jpg`,
              role: p.role || "student",
              status: p.status || "offline",
            }));
          }

          return {
            ...c,
            name: updatedName,
            avatar: updatedAvatar,
            messages: messages,
            participants: updatedParticipants,
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
  const handleSendMessage = async (
    conversationId: string,
    content: string,
    attachments?: File[],
    isForwarded?: boolean,
    replyTo?: { id: string; content: string; senderId: string; senderName: string }
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
            name: savedMessage.attachment.split('-').slice(2).join('-') || "Pièce jointe",
            url: `${API_URL}/uploads/${savedMessage.attachment}`,
            type: savedMessage.attachmentType || 'document',
            size: '?'
          }] : [],
          isForwarded: isForwarded,
          replyTo: replyTo
        };

        // Update UI with deduplication
        setConversations(prev => prev.map(conv => {
          if (String(conv.id) === String(conversationId)) {
            const messageIdStr = String(newMessage.id);
            if (!conv.messages.some(m => String(m.id) === messageIdStr)) {
              return { ...conv, messages: [...conv.messages, newMessage], lastMessage: newMessage };
            }
          }
          return conv;
        }));

        // Emit socket for real-time to others (if backend doesn't broadcast on API call)
        if (socket) {
          const eventName = conversation.type === 'group' ? 'groupMessage' : 'privateMessage';
          const payload = {
            ...savedMessage,
            senderId: currentUser.id,
            // Add necessary fields for the receiver to understand context
            ...(conversation.type === 'group' ? { groupId: conversation.id } : { recipientId: conversation.participants.find(p => p.id !== currentUser.id)?.id }),
            isForwarded: isForwarded,
            replyTo: replyTo,
            attachment: savedMessage.attachment,
            attachmentType: savedMessage.attachmentType
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
            photo: p.photo ? (p.photo.startsWith('http') ? p.photo : `${API_URL}/uploads/${p.photo}`) : `${API_URL}/default.jpg`
          })),
          messages: [],
          unreadCount: 0,
          avatar: `${API_URL}/group.png`,
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

  const handleAddGroupMembers = async (groupId: string, participants: User[]) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          members: participants.map(p => p.id)
        })
      });

      if (response.ok) {
        const result = await response.json();
        const updatedGroup = result.data.group;

        setConversations(prev => prev.map(conv => {
          if (conv.id === groupId) {
            return {
              ...conv,
              participants: updatedGroup.Users.map((u: any) => ({
                ...u,
                photo: u.photo ? (u.photo.startsWith('http') ? u.photo : `${API_URL}/uploads/${u.photo}`) : `${API_URL}/default.jpg`
              }))
            };
          }
          return conv;
        }));

        toast({ title: "Succès", description: "Membres ajoutés avec succès" });
      } else {
        const error = await response.json();
        toast({ title: "Erreur", description: error.message || "Échec de l'ajout", variant: "destructive" });
      }
    } catch (e) {
      console.error("Error adding members", e);
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" });
    }
  };

  const handleRemoveGroupMember = async (groupId: string, memberId: string) => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const updatedGroup = result.data.group;

        setConversations(prev => prev.map(conv => {
          if (conv.id === groupId) {
            return {
              ...conv,
              participants: updatedGroup.Users.map((u: any) => ({
                ...u,
                photo: u.photo ? (u.photo.startsWith('http') ? u.photo : `${API_URL}/uploads/${u.photo}`) : `${API_URL}/default.jpg`
              }))
            };
          }
          return conv;
        }));

        toast({ title: "Succès", description: "Membre retiré avec succès" });
      } else {
        const error = await response.json();
        toast({ title: "Erreur", description: error.message || "Échec du retrait", variant: "destructive" });
      }
    } catch (e) {
      console.error("Error removing member", e);
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setConversations(prev => prev.map(conv => {
      if (selectedConversationId && conv.id === selectedConversationId) {
        return {
          ...conv,
          messages: conv.messages.filter(m => m.id !== messageId)
        };
      }
      return conv;
    }));
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-wa-bg font-roboto">
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser || { id: "temp", name: "Chargement...", photo: "", role: "student", status: "offline" }}
        onOpenSettings={() => setShowSettings(true)}
        onCreateGroup={() => setShowCreateGroup(true)}
        onLogout={handleLogout}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar/Conversation List Layer */}
        {(!isMobile || (!selectedConversationId && !showSettings)) && (
          <div className={cn(
            "flex flex-col h-full bg-wa-bg transition-all duration-300 relative",
            isMobile ? "w-full" : "w-100 min-w-[420px] border-r border-border"
          )}>
            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between px-4 bg-wa-bg z-10">
              <div className="flex items-center gap-6">
                <button onClick={() => setIsDrawerOpen(true)} className="text-wa-text hover:bg-wa-panel p-2 rounded-full transition-colors">
                  <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-wa-text">ChatOff</h1>
              </div>
              <button className="text-wa-secondary hover:bg-wa-panel p-2 rounded-full transition-colors">
                <img src="/icon-192.png" alt="ChatOff" className="w-8 h-8 rounded-lg" />
              </button>
            </div>

            {/* Conversation List Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
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
                onOpenSettings={() => setShowSettings(true)}
                showCreateGroup={showCreateGroup}
                setShowCreateGroup={setShowCreateGroup}
                showCreateDM={showCreateDM}
                setShowCreateDM={setShowCreateDM}
                hideHeader={true}
                hideBottomNav={true}
                activeTab={activeTab}
              />
            </div>

            {/* Bottom Navigation */}
            <div className="h-16 flex items-center justify-around border-t border-border bg-wa-bg px-2">
              <BottomNavItem icon={UserIcon} label="Contacts" active={activeTab === "contacts"} onClick={() => setActiveTab("contacts")} />
              <BottomNavItem icon={Radio} label="Talks" active={activeTab === "talks"} onClick={() => setActiveTab("talks")} />
              <BottomNavItem icon={MessageSquare} label="Chats" active={activeTab === "chats"} onClick={() => setActiveTab("chats")} badge={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)} />
              <BottomNavItem icon={Users} label="Stories" active={activeTab === "stories"} onClick={() => setActiveTab("stories")} />
              <BottomNavItem icon={Phone} label="Appels" active={activeTab === "appels"} onClick={() => setActiveTab("appels")} />
            </div>

            {/* Floating Action Button */}
            <button
              onClick={() => setShowCreateDM(true)}
              className="absolute right-6 bottom-20 w-14 h-14 bg-wa-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
            >
              <Edit2 size={24} />
            </button>
          </div>
        )}

        {/* Chat Content Layer */}
        {(!isMobile || selectedConversationId || showSettings) && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-wa-bg border-l border-border relative">
            {showSettings ? (
              <SettingsView
                currentUser={currentUser || { id: "temp", name: "Chargement...", photo: "", role: "student", status: "offline" }}
                onClose={() => setShowSettings(false)}
                onUpdateUser={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                }}
              />
            ) : selectedConversation ? (
              <ChatArea
                conversation={selectedConversation}
                currentUser={currentUser || { id: "temp", name: "Chargement...", photo: "", role: "student", status: "offline" }}
                users={users}
                conversations={conversations}
                isConnected={isConnected}
                onSendMessage={handleSendMessage}
                onToggleSidebar={toggleSidebar}
                onDeleteMessage={handleDeleteMessage}
                onAddMembers={handleAddGroupMembers}
                onRemoveMember={handleRemoveGroupMember}
                onClose={() => setSelectedConversationId(null)}
              />
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-wa-secondary opacity-20">
                <MessageSquare size={100} />
                <p className="mt-4 text-xl">Sélectionnez une discussion</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BottomNavItem = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 flex-1 py-1 transition-all",
      active ? "text-wa-primary" : "text-wa-secondary"
    )}
  >
    <div className="relative">
      <Icon size={22} className={active ? "scale-110" : ""} />
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-wa-primary text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-wa-bg px-0.5">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Index;
