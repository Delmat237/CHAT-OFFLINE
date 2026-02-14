
import React from "react";
import { ArrowLeft, Phone, Video, MessageSquare, Pin, Bell, Star, Info, AlertCircle, LogOut, ChevronRight, Edit2, MoreVertical, UserPlus, User as UserIcon, Shield } from "lucide-react";
import Avatar from "./Avatar";
import { Conversation, User } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import AddMemberModal from "./AddMemberModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationInfoProps {
    conversation: Conversation;
    users: User[];
    onClose: () => void;
    onStartMessage?: () => void;
    onAddMembers?: (selectedUsers: User[]) => void;
    onRemoveMember?: (userId: string) => void;
}

const ConversationInfo: React.FC<ConversationInfoProps> = ({
    conversation,
    users,
    onClose,
    onStartMessage,
    onAddMembers,
    onRemoveMember
}) => {
    const [showAddMember, setShowAddMember] = React.useState(false);
    const isGroup = conversation.type === "group";
    const participant = !isGroup ? conversation.participants[0] : null;

    return (
        <div className="absolute inset-0 bg-wa-bg z-50 flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-wa-bg/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
                <button onClick={onClose} className="p-2 text-wa-text hover:bg-wa-panel rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-wa-text hover:bg-wa-panel rounded-full transition-colors">
                        <Edit2 size={20} />
                    </button>
                    <button className="p-2 text-wa-text hover:bg-wa-panel rounded-full transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center px-6 pb-8 pt-4">
                <Avatar src={conversation.avatar} alt={conversation.name} size="xl" className="w-32 h-32 mb-4 border-4 border-wa-panel shadow-xl" />
                <h2 className="text-[22px] font-bold text-wa-text flex items-center gap-2">
                    {isGroup && "🧠"} {conversation.name}
                </h2>
                {!isGroup && participant && (
                    <p className="text-sm text-wa-text-secondary mt-1">En ligne</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-around px-4 mb-6 border-y border-border/50 bg-wa-panel/30 py-4">
                {isGroup ? (
                    <>
                        <ActionButton icon={UserPlus} label="Ajouter" onClick={() => setShowAddMember(true)} />
                        <ActionButton icon={AlertCircle} label="Signaler" />
                        <ActionButton icon={LogOut} label="Quitter" />
                        <ActionButton icon={MessageSquare} label="Message" onClick={onStartMessage} />
                    </>
                ) : (
                    <>
                        <ActionButton icon={Phone} label="Appel audio" />
                        <ActionButton icon={Video} label="Appel vidéo" />
                        <ActionButton icon={MessageSquare} label="Message" onClick={onStartMessage} />
                    </>
                )}
            </div>

            {/* Shared Files (Mockup) */}
            {isGroup && (
                <div className="px-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[15px] font-semibold text-pink-400">Fichiers partagés</span>
                        <button className="text-[13px] text-cyan-400 flex items-center gap-1">
                            Voir tout <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar">
                        <div className="w-32 h-32 bg-wa-panel rounded-lg overflow-hidden flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop" className="w-full h-full object-cover" />
                        </div>
                        <div className="w-32 h-32 bg-wa-panel rounded-lg overflow-hidden flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            )}

            {/* Group Members Section */}
            {isGroup && (
                <div className="px-6 mb-6">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <span className="text-[14px] font-semibold text-pink-400 uppercase tracking-wider opacity-80">Membres du groupe</span>
                        <span className="text-[12px] text-wa-text-secondary bg-wa-panel px-2 py-0.5 rounded-full">
                            {conversation.participants.length}
                        </span>
                    </div>
                    <div className="space-y-1 bg-wa-panel/30 rounded-2xl p-2">
                        {conversation.participants.map((member) => (
                            <ParticipantItem
                                key={member.id}
                                participant={member}
                                showActions={isGroup}
                                onRemove={() => onRemoveMember && onRemoveMember(member.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Settings Section */}
            <div className="px-6 space-y-1 mb-6">
                <h3 className="text-[14px] font-semibold text-pink-400 mb-3 px-1 uppercase tracking-wider opacity-80">Paramètres et autres</h3>
                <SettingsItem icon={Pin} label="Épingler la conversation" showSwitch />
                <SettingsItem icon={Bell} label="Notifications" showSwitch defaultChecked />
                <SettingsItem icon={Star} label="Messages importants" />
            </div>

            {/* About Section */}
            <div className="px-6 pb-12">
                <h3 className="text-[14px] font-semibold text-pink-400 mb-3 px-1 uppercase tracking-wider opacity-80">À propos</h3>
                {!isGroup ? (
                    <div className="bg-wa-panel/40 rounded-2xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-wa-primary/10 rounded-full text-wa-primary">
                            <UserIcon size={20} />
                        </div>
                        <div>
                            <p className="text-[15px] text-wa-text font-medium">{conversation.name}</p>
                            <p className="text-[12px] text-wa-text-secondary mt-0.5">Nom</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-wa-panel/40 rounded-2xl p-4 flex items-start gap-4">
                        <div className="p-2 bg-wa-primary/10 rounded-full text-wa-primary">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-[15px] text-wa-text font-medium">Description du groupe</p>
                            <p className="text-[12px] text-wa-text-secondary mt-0.5">Détails sur ce collectif...</p>
                        </div>
                    </div>
                )}
            </div>

            <AddMemberModal
                open={showAddMember}
                onOpenChange={setShowAddMember}
                users={users}
                currentParticipants={conversation.participants}
                onAddMembers={(selected) => {
                    if (onAddMembers) onAddMembers(selected);
                    setShowAddMember(false);
                }}
            />
        </div>
    );
};

const ActionButton = ({ icon: Icon, label, onClick }: any) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
        <div className="w-12 h-12 rounded-xl bg-wa-panel flex items-center justify-center text-wa-secondary group-hover:text-wa-primary transition-colors shadow-sm">
            <Icon size={22} />
        </div>
        <span className="text-[11px] font-medium text-wa-text opacity-70">{label}</span>
    </button>
);

const SettingsItem = ({ icon: Icon, label, showSwitch, defaultChecked }: any) => (
    <div className="flex items-center justify-between py-3 hover:bg-wa-panel/30 px-2 rounded-xl cursor-pointer transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-wa-panel text-wa-secondary group-hover:text-wa-primary">
                <Icon size={20} />
            </div>
            <span className="text-[15px] text-wa-text tracking-wide">{label}</span>
        </div>
        {showSwitch && <Switch defaultChecked={defaultChecked} />}
    </div>
);

const ParticipantItem = ({ participant, showActions, onRemove }: { participant: User, showActions?: boolean, onRemove?: () => void }) => (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-wa-panel/40 rounded-xl transition-colors cursor-pointer group">
        <div className="flex items-center gap-4">
            <Avatar src={participant.photo} alt={participant.name} size="sm" status={participant.status} />
            <div className="flex flex-col">
                <span className="text-[15px] font-medium text-wa-text">{participant.name}</span>
                <span className="text-[11px] text-wa-text-secondary capitalize">{participant.role}</span>
            </div>
        </div>
        {showActions && (
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-wa-secondary opacity-0 group-hover:opacity-100 p-1 hover:bg-wa-bg rounded-full transition-all outline-none">
                            <MoreVertical size={16} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-wa-panel border-border text-wa-text w-48">
                        <DropdownMenuItem onClick={onRemove} className="hover:bg-wa-bg/10 focus:bg-wa-bg/10 cursor-pointer py-2.5 flex items-center gap-3 text-red-400 focus:text-red-400">
                            <LogOut size={16} />
                            <span>Retirer du groupe</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )}
    </div>
);

export default ConversationInfo;
