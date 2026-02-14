
import React from "react";
import { User, Group, MapPin, Star, Settings, Moon, Smartphone, UserPlus, LogOut, ChevronRight } from "lucide-react";
import Avatar from "./Avatar";
import { User as UserType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface SideDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserType;
    onOpenSettings: () => void;
    onCreateGroup?: () => void;
    onLogout?: () => void;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, currentUser, onOpenSettings, onCreateGroup, onLogout }) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-80 bg-wa-bg z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Profile Header */}
                <div className="p-6 bg-wa-panel flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <Avatar src={currentUser.photo} alt={currentUser.name || "Delmat"} className="w-16 h-16 border-2 border-wa-primary" />
                        <div className="flex gap-4">
                            {/* Optional icons like QR or similar */}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-wa-text">{currentUser.name || "Delmat"}</h2>
                        <p className="text-sm text-wa-text-secondary">+237694773472</p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2">
                    <MenuItem icon={User} label="Nouveau groupe" onClick={() => { onCreateGroup?.(); onClose(); }} />
                    <MenuItem icon={User} label="Nouveau Kongossa" badge="N" />
                    <MenuItem icon={MapPin} label="Talks à proximité" />
                    <MenuItem icon={Star} label="Messages importants" />
                    <MenuItem icon={Group} label="Discussions de groupe" />

                    <div className="h-px bg-border my-2" />

                    <div className="px-6 py-3 flex items-center justify-between hover:bg-wa-panel/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-4">
                            <Moon size={22} className="text-wa-secondary" />
                            <span className="text-[15px] font-medium text-wa-text">Mode nuit</span>
                        </div>
                        <Switch checked={document.documentElement.classList.contains('dark')} onCheckedChange={(checked) => {
                            if (checked) {
                                document.documentElement.classList.add('dark');
                                localStorage.setItem('theme', 'dark');
                            } else {
                                document.documentElement.classList.remove('dark');
                                localStorage.setItem('theme', 'light');
                            }
                        }} />
                    </div>

                    <MenuItem icon={Smartphone} label="Appareils connectés" />
                    <MenuItem icon={Settings} label="Paramètres" onClick={() => { onOpenSettings(); onClose(); }} />
                    <MenuItem icon={UserPlus} label="Inviter les amis" />

                    <div className="mt-auto pb-4">
                        <div className="h-px bg-border my-2" />
                        <MenuItem icon={LogOut} label="Déconnexion" className="text-cyan-500" onClick={onLogout} />
                    </div>
                </div>
            </div>
        </>
    );
};

interface MenuItemProps {
    icon: any;
    label: string;
    badge?: string;
    onClick?: () => void;
    className?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, badge, onClick, className }) => (
    <div
        onClick={onClick}
        className={cn(
            "px-6 py-3.5 flex items-center gap-4 hover:bg-wa-panel/50 cursor-pointer transition-colors",
            className
        )}
    >
        <Icon size={22} className="text-wa-secondary" />
        <span className="text-[15px] font-medium text-wa-text flex-1">{label}</span>
        {badge && (
            <span className="bg-wa-primary/10 text-wa-primary text-xs font-bold px-1.5 py-0.5 rounded leading-none">
                {badge}
            </span>
        )}
    </div>
);

export default SideDrawer;
