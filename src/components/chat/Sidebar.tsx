import React, { useState } from "react";
import { Search, Plus, CloudOff, Clock, ArrowLeft, MessageSquare, Users } from "lucide-react";
import Avatar from "./Avatar";
import { User, Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import CreateGroupModal from "./CreateGroupModal";
import CreateDirectMessageModal from "./CreateDirectMessageModal";

interface SidebarProps {
  users: User[];
  conversations: Conversation[];
  currentUser: User;
  isConnected: boolean;
  onSelectConversation: (id: string) => void;
  selectedConversationId: string | null;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCreateGroup: (name: string, participants: User[]) => void;
  onStartConversation: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  users,
  conversations,
  currentUser,
  isConnected,
  onSelectConversation,
  selectedConversationId,
  isSidebarOpen,
  onToggleSidebar,
  onCreateGroup,
  onStartConversation,
}) => {
  const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const uniqueConversations = Array.from(
    new Map(conversations.map(c => [c.id, c])).values()
  );

  const filteredConversations = uniqueConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessagePreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return "";

    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      return `📎 ${lastMessage.attachments[0].name}`;
    }

    return lastMessage.content.length > 30
      ? `${lastMessage.content.substring(0, 30)}...`
      : lastMessage.content;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };



  if (isMobile && !isSidebarOpen) return null;

  return (
    <div className={cn(
      "h-screen flex flex-col bg-ecole-secondary border-r border-gray-200 transition-all duration-300",
      isMobile ? (isSidebarOpen ? "fixed z-40 w-full" : "hidden") : "w-80 min-w-80"
    )}>
      {/* Header */}
      <div className="bg-ecole-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">École Chat</h1>
          {!isConnected && (
            <div className="flex items-center ml-3 text-xs animate-pulse-subtle">
              <CloudOff size={14} className="mr-1" />
              <span>Hors ligne</span>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-1 rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
        )}
      </div>

      {/* User info & Tabs */}
      <div className="p-3 flex items-center bg-ecole-primary/10">
        <Avatar
          src={currentUser.photo}
          alt={currentUser.name}
          status={currentUser.status}
        />
        <div className="ml-3 flex-1 text-sm">
          <div className="font-medium text-ecole-text">{currentUser.name}</div>
          <div className="text-ecole-meta text-xs">
            {currentUser.role === "teacher" ? "Professeur" :
              currentUser.role === "student" ? "Élève" : "Personnel"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={cn(
            "flex-1 py-2 text-center text-sm font-medium",
            activeTab === "chats"
              ? "text-ecole-primary border-b-2 border-ecole-primary"
              : "text-ecole-meta hover:text-ecole-text"
          )}
          onClick={() => setActiveTab("chats")}
        >
          Conversations
        </button>
        <button
          className={cn(
            "flex-1 py-2 text-center text-sm font-medium",
            activeTab === "users"
              ? "text-ecole-primary border-b-2 border-ecole-primary"
              : "text-ecole-meta hover:text-ecole-text"
          )}
          onClick={() => setActiveTab("users")}
        >
          Répertoire
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ecole-meta"
          />
          <input
            type="text"
            placeholder={
              activeTab === "chats"
                ? "Rechercher une conversation..."
                : "Rechercher un utilisateur..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-3 bg-gray-100 rounded-md text-sm placeholder-ecole-meta text-ecole-text focus:outline-none focus:ring-1 focus:ring-ecole-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          <div>
            {/* Group Heading */}
            <div className="px-4 py-2 text-xs font-semibold text-ecole-meta uppercase tracking-wider">
              Groupes
            </div>

            {/* Group List */}
            {filteredConversations
              .filter((conv) => conv.type === "group")
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "px-4 py-3 flex items-center cursor-pointer hover:bg-gray-100",
                    selectedConversationId === conversation.id && "bg-gray-100"
                  )}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    if (isMobile) onToggleSidebar();
                  }}
                >
                  <div className="mr-3">
                    <Avatar
                      alt={conversation.name}
                      src={conversation.avatar}
                      className="bg-ecole-primary/80"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-ecole-text truncate">
                        {conversation.name}
                      </span>
                      {conversation.messages.length > 0 && (
                        <span className="text-xs text-ecole-meta">
                          {formatTimestamp(conversation.messages[conversation.messages.length - 1].timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ecole-meta truncate flex items-center">
                      {conversation.messages.length > 0 &&
                        conversation.messages[conversation.messages.length - 1].status === "pending" && (
                          <Clock size={12} className="mr-1 text-ecole-offline" />
                        )}
                      {getLastMessagePreview(conversation)}
                    </div>
                  </div>
                  {conversation.unreadCount ? (
                    <div className="ml-2 bg-ecole-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  ) : null}
                </div>
              ))}

            {/* Contacts Heading */}
            <div className="px-4 py-2 text-xs font-semibold text-ecole-meta uppercase tracking-wider mt-2">
              Contacts Directs
            </div>

            {/* Contacts List */}
            {filteredConversations
              .filter((conv) => conv.type === "user")
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "px-4 py-3 flex items-center cursor-pointer hover:bg-gray-100",
                    selectedConversationId === conversation.id && "bg-gray-100"
                  )}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    if (isMobile) onToggleSidebar();
                  }}
                >
                  <div className="mr-3">
                    <Avatar
                      src={conversation.avatar}
                      alt={conversation.name}
                      status={conversation.participants[0]?.status}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-ecole-text truncate">
                        {conversation.name}
                      </span>
                      {conversation.messages.length > 0 && (
                        <span className="text-xs text-ecole-meta">
                          {formatTimestamp(conversation.messages[conversation.messages.length - 1].timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-ecole-meta truncate flex items-center">
                      {conversation.messages.length > 0 &&
                        conversation.messages[conversation.messages.length - 1].status === "pending" && (
                          <Clock size={12} className="mr-1 text-ecole-offline" />
                        )}
                      {getLastMessagePreview(conversation)}
                    </div>
                  </div>
                  {conversation.unreadCount ? (
                    <div className="ml-2 bg-ecole-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  ) : null}
                </div>
              ))}

            {filteredConversations.length === 0 && (
              <div className="p-4 text-center text-ecole-meta">
                Aucune conversation trouvée
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-3 space-y-2">
              <CreateDirectMessageModal
                users={users}
                currentUser={currentUser}
                onStartConversation={onStartConversation}
              />

              <CreateGroupModal
                users={users}
                currentUser={currentUser}
                onCreateGroup={onCreateGroup}
              />
            </div>
          </div>
        ) : (
          <div>
            {/* Filter Tabs */}
            <div className="flex px-3 py-2">
              <button className="flex-1 py-1 text-center text-xs font-medium bg-ecole-primary text-white rounded-l-md">
                Tous
              </button>
              <button className="flex-1 py-1 text-center text-xs font-medium bg-gray-100 text-ecole-meta hover:bg-gray-200">
                Élèves
              </button>
              <button className="flex-1 py-1 text-center text-xs font-medium bg-gray-100 text-ecole-meta hover:bg-gray-200">
                Professeurs
              </button>
              <button className="flex-1 py-1 text-center text-xs font-medium bg-gray-100 text-ecole-meta hover:bg-gray-200 rounded-r-md">
                Personnel
              </button>
            </div>

            {/* Users List */}
            <div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    // Find or create a conversation with this user
                    const existingConversation = conversations.find(
                      (conv) =>
                        conv.type === "user" &&
                        conv.participants.some((p) => p.id === user.id)
                    );

                    if (existingConversation) {
                      onSelectConversation(existingConversation.id);
                    } else {
                      // This would create a new conversation in a real app
                      onStartConversation(user.id);
                    }

                    if (isMobile) onToggleSidebar();
                  }}
                >
                  <div className="mr-3">
                    <Avatar src={user.photo} alt={user.name} status={user.status} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ecole-text">{user.name}</div>
                    <div className="text-xs text-ecole-meta">
                      {user.role === "teacher" ? "Professeur" :
                        user.role === "student" ? "Élève" : "Personnel"}
                      {user.status === "offline" && user.lastSeen && (
                        <span> · Vu {formatTimestamp(user.lastSeen)}</span>
                      )}
                    </div>
                  </div>
                  {user.status === "online" ? (
                    <div className="w-2 h-2 bg-ecole-accent rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-ecole-offline rounded-full"></div>
                  )}
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-ecole-meta">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
