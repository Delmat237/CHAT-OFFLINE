
import React from "react";
import { ArrowLeft, CloudOff, Search, Phone, MoreVertical, Image, Info } from "lucide-react";
import Avatar from "./Avatar";
import { Conversation } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ChatHeaderProps {
  conversation: Conversation;
  isConnected: boolean;
  onToggleSidebar: () => void;
  onInitiateCall?: () => void;
  onClose?: () => void;
  onShowInfo?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  isConnected,
  onToggleSidebar,
  onInitiateCall,
  onClose,
  onShowInfo
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getParticipantStatus = () => {
    if (conversation.type === "user") {
      const participant = conversation.participants[0];
      if (!participant) return "";
      if (participant.status === "online") return "En ligne";
      return participant.lastSeen ? `Vu hier à ${new Date(participant.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Vu hier à 17:06"; // Mocking from screenshot if not available
    } else {
      const names = conversation.participants.map(p => p.name);
      if (names.length <= 3) return names.join(", ");
      return `${names.slice(0, 3).join(", ")}... (+${names.length - 3})`;
    }
  };

  return (
    <div className="h-16 flex items-center justify-between px-2 bg-wa-panel border-b border-border transition-colors">
      <div className="flex items-center gap-1">
        <button
          onClick={onClose}
          className="p-2 text-wa-text hover:bg-wa-bg/10 rounded-full transition-colors outline-none"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={onShowInfo}>
          <Avatar
            src={conversation.avatar}
            alt={conversation.name}
            status={conversation.type === "user" ? conversation.participants[0]?.status : undefined}
            size="md"
          />

          <div className="flex flex-col">
            <span className="font-bold text-[16px] leading-tight text-wa-text truncate max-w-[180px]">
              {conversation.name}
            </span>
            <span className="text-[12px] text-wa-text-secondary leading-tight">
              {getParticipantStatus()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isConnected && (
          <CloudOff size={18} className="text-amber-500 animate-pulse" />
        )}

        <button className="p-2 text-wa-text hover:bg-wa-bg/10 rounded-full transition-colors outline-none">
          <Phone size={22} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-wa-text hover:bg-wa-bg/10 rounded-full transition-colors outline-none">
              <MoreVertical size={22} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-wa-panel border-border text-wa-text w-56">
            <DropdownMenuItem onClick={onShowInfo} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5 flex items-center gap-3">
              <Info size={18} className="text-wa-secondary" />
              <span>{conversation.type === 'group' ? "Infos du groupe" : "Infos du contact"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Médias", description: "Bientôt disponible" })} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5 flex items-center gap-3">
              <Image size={18} className="text-wa-secondary" />
              <span>Médias partagés</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Rechercher", description: "Bientôt disponible" })} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5 flex items-center gap-3">
              <Search size={18} className="text-wa-secondary" />
              <span>Rechercher dans la discussion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;
