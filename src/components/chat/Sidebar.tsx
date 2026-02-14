import React, { useState } from "react";
import { Search, Plus, CloudOff, Clock, ArrowLeft, MessageSquare, Users, Settings, Camera, MoreVertical, Radio, Phone, CheckCheck, MessageSquarePlus } from "lucide-react";
import Avatar from "./Avatar";
import { User, Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
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
  onStartConversation: (userId: string) => void;
  onCreateGroup: (name: string, participants: User[]) => void;
  onOpenSettings: () => void;
  showCreateGroup: boolean;
  setShowCreateGroup: (show: boolean) => void;
  showCreateDM: boolean;
  setShowCreateDM: (show: boolean) => void;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  activeTab?: string;
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
  onOpenSettings,
  showCreateGroup,
  setShowCreateGroup,
  showCreateDM,
  setShowCreateDM,
  hideHeader = false,
  hideBottomNav = false,
  activeTab: activeTabExternal = "chats",
}) => {
  const [activeTabInternal, setActiveTabInternal] = useState<"chats" | "status" | "communities" | "calls">("chats");
  const activeTab = activeTabExternal === "contacts" ? "contacts" : activeTabInternal;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const uniqueConversations = Array.from(
    new Map(conversations.map(c => [c.id, c])).values()
  );

  const filteredConversations = uniqueConversations.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" ||
      (activeFilter === "unread" && conv.unreadCount && conv.unreadCount > 0) ||
      (activeFilter === "groups" && conv.type === "group");
    return matchesSearch && matchesFilter;
  });

  const getLastMessagePreview = (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage && !conversation.lastMessage) return "";

    const msg = lastMessage || conversation.lastMessage;
    if (msg.attachments && msg.attachments.length > 0) {
      return `📎 Pièce jointe`;
    }

    const content = msg.content || "";
    return content.length > 40
      ? `${content.substring(0, 40)}...`
      : content;
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '/');
    }
  };

  return (
    <div className={cn(
      "h-screen flex flex-col bg-wa-bg text-wa-text transition-all duration-300",
      isMobile ? "w-full" : "w-100 min-w-[400px] border-r border-border"
    )}>
      {/* Top Header */}
      {!hideHeader && (
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-wa-text">École Chat</h1>
          <div className="flex items-center gap-5">
            <button
              onClick={() => toast({ title: "Caméra", description: "La fonctionnalité caméra sera bientôt disponible." })}
              className="p-1 hover:bg-wa-panel rounded-full transition-colors text-wa-secondary"
            >
              <Camera size={24} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-wa-panel rounded-full transition-colors text-wa-secondary outline-none">
                  <MoreVertical size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-wa-panel border-border text-wa-text w-52">
                <DropdownMenuItem onClick={() => setShowCreateGroup(true)} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5">
                  Nouveau groupe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCreateDM(true)} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5">
                  Nouvelle conversation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenSettings} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5">
                  Paramètres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Search Header Style */}
      <div className="px-3 py-2">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Search size={18} className="text-wa-secondary group-focus-within:text-wa-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Rechercher"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-12 pr-4 bg-wa-panel rounded-full text-sm placeholder:text-wa-secondary text-wa-text outline-none focus:ring-1 focus:ring-transparent transition-all"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
        {(activeTab === "contacts" ? [
          { id: "all", label: "Tous" },
          { id: "student", label: "Élèves" },
          { id: "teacher", label: "Enseignants" },
          { id: "staff", label: "Personnel" }
        ] : [
          { id: "all", label: "Toutes" },
          { id: "unread", label: "Non lues" },
          { id: "favorites", label: "Favoris" },
          { id: "groups", label: "Groupes" }
        ]).map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeFilter === filter.id
                ? "bg-wa-primary/10 text-wa-primary"
                : "bg-wa-panel text-wa-secondary hover:bg-wa-panel/80"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === "contacts" ? (
          /* User List (Contacts) */
          <div className="flex flex-col">
            {users.filter(u => {
              const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesFilter = activeFilter === "all" ||
                (activeFilter === "staff" ? (u.role === "worker" || u.role === "admin") : u.role === activeFilter);
              return u.id !== currentUser.id && matchesSearch && matchesFilter;
            }).map((user) => (
              <div
                key={user.id}
                className="px-4 py-3 flex items-center cursor-pointer hover:bg-wa-panel/50 transition-colors border-b border-border/50 last:border-0"
                onClick={() => {
                  onStartConversation(user.id);
                  if (isMobile) onToggleSidebar();
                }}
              >
                <div className="mr-4">
                  <Avatar
                    src={user.photo}
                    alt={user.name}
                    size="lg"
                    status={user.status}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-wa-text truncate text-[16px]">
                      {user.name}
                    </h3>
                  </div>
                  <div className="text-[13px] text-wa-secondary truncate capitalize">
                    {user.role}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 mt-10">
                <Users size={48} className="text-wa-secondary mb-4" />
                <p className="text-wa-text">Aucun contact trouvé</p>
              </div>
            )}
          </div>
        ) : (
          /* Conversation List */
          <>
            {filteredConversations.map((conversation) => {
              const lastMsg = conversation.messages[conversation.messages.length - 1] || conversation.lastMessage;
              const isSelected = selectedConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "px-4 py-3 flex items-center cursor-pointer transition-colors relative group",
                    isSelected ? "bg-wa-panel" : "hover:bg-wa-panel/50"
                  )}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    if (isMobile) onToggleSidebar();
                  }}
                >
                  <div className="mr-4">
                    <Avatar
                      src={conversation.avatar}
                      alt={conversation.name}
                      size="lg"
                      status={conversation.type === "user" ? conversation.participants[0]?.status : undefined}
                    />
                  </div>

                  <div className="flex-1 min-w-0 border-b border-border pb-3 group-last:border-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-wa-text truncate text-[17px]">
                        {conversation.name}
                      </h3>
                      {lastMsg && (
                        <span className={cn(
                          "text-xs ml-2",
                          conversation.unreadCount ? "text-wa-primary font-bold" : "text-wa-secondary"
                        )}>
                          {formatTimestamp(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-[14.5px] text-wa-secondary truncate flex items-center gap-1">
                        {lastMsg && lastMsg.senderId === currentUser.id && (
                          <CheckCheck size={16} className="text-wa-check-blue flex-shrink-0" />
                        )}
                        <span className="truncate">{getLastMessagePreview(conversation)}</span>
                      </div>

                      {conversation.unreadCount ? (
                        <div className="bg-wa-primary text-wa-bg text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[50%] p-8 text-center">
                <div className="p-4 bg-wa-panel rounded-full mb-4">
                  <MessageSquare size={32} className="text-wa-secondary" />
                </div>
                <p className="text-wa-secondary text-sm">Aucune discussion trouvée</p>
              </div>
            )}
          </>
        )}
      </div>


      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <div className="bg-wa-bg border-t border-border px-4 py-2 flex justify-between items-center mt-auto">
          {[
            { id: "chats", label: "Discussions", icon: MessageSquare, badge: uniqueConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0) },
            { id: "status", label: "Actus", icon: Radio },
            { id: "communities", label: "Communautés", icon: Users },
            { id: "calls", label: "Appels", icon: Phone }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabInternal(tab.id as any)}
              className={cn(
                "flex flex-col items-center gap-1 group py-1 min-w-[70px]",
                activeTab === tab.id ? "text-white" : "text-wa-secondary"
              )}
            >
              <div className={cn(
                "px-5 py-1 rounded-full relative transition-colors",
                activeTab === tab.id ? "bg-wa-primary/10 text-wa-primary" : "group-hover:bg-wa-panel/20"
              )}>
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.badge ? (
                  <span className="absolute -top-1 -right-1 bg-wa-primary text-wa-bg text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-wa-bg">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-colors",
                activeTab === tab.id ? "text-wa-primary" : "text-wa-secondary"
              )}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateDirectMessageModal
        users={users}
        currentUser={currentUser}
        onStartConversation={onStartConversation}
        open={showCreateDM}
        onOpenChange={setShowCreateDM}
      />

      <CreateGroupModal
        users={users}
        currentUser={currentUser}
        onCreateGroup={onCreateGroup}
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
    </div>
  );
};

export default Sidebar;
