
import React, { useState, useEffect } from "react";
import { User, LogOut, Moon, Sun, Monitor, Bell, Shield, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Avatar from "./Avatar";
import { User as UserType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

interface SettingsViewProps {
    currentUser: UserType;
    onClose: () => void;
    onUpdateUser?: (updatedUser: UserType) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentUser, onClose, onUpdateUser }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setDarkMode(isDarkMode);
    }, []);

    const toggleDarkMode = (enabled: boolean) => {
        setDarkMode(enabled);
        if (enabled) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("darkMode", "true");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("darkMode", "false");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const statusOptions: { label: string; value: 'online' | 'busy' | 'away' | 'offline'; color: string }[] = [
        { label: "En ligne", value: "online", color: "bg-ecole-accent" },
        { label: "Occupé", value: "busy", color: "bg-red-500" },
        { label: "Absent", value: "away", color: "bg-yellow-500" },
        { label: "Hors ligne", value: "offline", color: "bg-ecole-offline" },
    ];

    const handleStatusChange = (status: 'online' | 'busy' | 'away' | 'offline') => {
        if (onUpdateUser) {
            onUpdateUser({ ...currentUser, status });
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("photo", file);

        try {
            const response = await fetch(`${API_URL}/api/users/update-profile`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                const updatedUser = result.data.user;

                // Construct full photo URL
                const photoUrl = updatedUser.photo ? (updatedUser.photo.startsWith('http') ? updatedUser.photo : `${API_URL}/uploads/${updatedUser.photo}`) : '';
                const finalUser = { ...updatedUser, photo: photoUrl };

                if (onUpdateUser) {
                    onUpdateUser(finalUser);
                }

                toast({ title: "Succès", description: "Photo de profil mise à jour" });
            } else {
                toast({ title: "Erreur", description: "Échec de la mise à jour", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error uploading photo", error);
            toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-wa-bg transition-colors duration-300">
            {/* Header */}
            <div className="border-b border-border p-4 flex items-center bg-wa-panel transition-colors sticky top-0 z-20">
                <button
                    onClick={onClose}
                    className="mr-3 p-2 rounded-xl hover:bg-wa-bg/10 transition-all active:scale-95"
                    title="Retour"
                >
                    <ArrowLeft size={20} className="text-wa-primary" />
                </button>
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-wa-text leading-none">Paramètres</h2>
                    <span className="text-[10px] text-wa-text-secondary uppercase tracking-widest mt-0.5">Configuration du compte</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full space-y-8">
                {/* Profile Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wider">Profil</h3>
                    <div className="bg-wa-panel p-6 rounded-[2.5rem] border border-border flex flex-col items-center sm:flex-row sm:items-start gap-6 shadow-sm">
                        <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                            <div className={cn(
                                "p-1 rounded-full bg-gradient-to-tr from-wa-primary to-cyan-400 shadow-lg transition-transform",
                                isUploading ? "animate-pulse" : "group-hover:scale-105"
                            )}>
                                <Avatar
                                    src={currentUser.photo}
                                    alt={currentUser.name}
                                    className="w-24 h-24 sm:w-20 sm:h-20 ring-4 ring-white dark:ring-gray-800"
                                    status={currentUser.status}
                                />
                            </div>
                            <button className="absolute bottom-1 right-1 bg-wa-primary text-white p-2 rounded-full shadow-md border-2 border-wa-panel transition-transform active:scale-90">
                                <Monitor size={12} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>
                        <div className="text-center sm:text-left space-y-1 flex-1">
                            <h4 className="text-xl font-bold text-wa-text">{currentUser.name}</h4>
                            <p className="text-wa-text-secondary">
                                {currentUser.role === "teacher" ? "Professeur" :
                                    currentUser.role === "student" ? "Élève" : "Personnel"}
                            </p>
                            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleStatusChange(opt.value)}
                                        className={cn(
                                            "px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border",
                                            currentUser.status === opt.value
                                                ? "bg-ecole-primary border-ecole-primary text-white"
                                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-ecole-text dark:text-gray-300 hover:border-ecole-primary/50"
                                        )}
                                    >
                                        <span className={cn("w-2 h-2 rounded-full", opt.color)}></span>
                                        {opt.label}
                                        {currentUser.status === opt.value && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wider">Apparence</h3>
                    <div className="bg-wa-panel p-1.5 rounded-2xl border border-border flex gap-1 items-center">
                        <button
                            onClick={() => toggleDarkMode(false)}
                            className={cn(
                                "flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300",
                                !darkMode ? "bg-wa-bg shadow-lg text-wa-primary scale-[1.02]" : "text-wa-text-secondary hover:bg-wa-bg/50"
                            )}
                        >
                            <Sun size={18} className={cn(!darkMode && "animate-pulse")} />
                            <span className="font-bold">Clair</span>
                        </button>
                        <button
                            onClick={() => toggleDarkMode(true)}
                            className={cn(
                                "flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all duration-300",
                                darkMode ? "bg-wa-bg shadow-lg text-wa-primary scale-[1.02]" : "text-wa-text-secondary hover:bg-wa-bg/50"
                            )}
                        >
                            <Moon size={18} className={cn(darkMode && "animate-pulse")} />
                            <span className="font-bold">Sombre</span>
                        </button>
                    </div>
                </section>

                {/* Notifications & Security */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-wa-text-secondary uppercase tracking-wider">Préférences</h3>
                    <div className="bg-wa-panel rounded-2xl border border-border divide-y divide-border">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-wa-bg text-wa-primary rounded-lg">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <div className="font-medium text-wa-text">Notifications</div>
                                    <div className="text-xs text-wa-text-secondary">Alertes sonores et visuelles</div>
                                </div>
                            </div>
                            <div className="w-10 h-6 bg-wa-primary rounded-full relative">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-wa-bg text-wa-primary rounded-lg">
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <div className="font-medium text-wa-text">Confidentialité</div>
                                    <div className="text-xs text-wa-text-secondary">Masquer votre dernière connexion</div>
                                </div>
                            </div>
                            <div className="w-10 h-6 bg-wa-secondary/30 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Section */}
                <section className="pt-4">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 py-6 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all font-bold"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </Button>
                </section>
            </div>

            <div className="p-8 text-center text-xs text-ecole-meta dark:text-gray-500">
                École Chat v1.0.0 · Version Responsive
            </div>
        </div>
    );
};

export default SettingsView;
