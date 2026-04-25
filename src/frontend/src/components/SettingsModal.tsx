import React, { useState, useRef } from 'react';
import { X, Camera, User, AtSign, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';
import { Avatar } from './Avatar';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { user, updateUser } = useAuthStore();
    const [fullname, setFullname] = useState(user?.fullname || '');
    const [username, setUsername] = useState(user?.username || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const { url } = await userApi.uploadAvatar(file);
            updateUser({ avatarUrl: url });
        } catch (error) {
            console.error("Avatar upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updatedUser = await userApi.updateProfile({ fullname, username });
            updateUser(updatedUser);
            onClose();
        } catch (error) {
            console.error("Profile update failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800 flex items-center justify-center">
                                {isUploading ? (
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                ) : (
                                    <Avatar 
                                        url={user?.avatarUrl} 
                                        name={user?.fullname || user?.username || '?'} 
                                        className="w-full h-full text-4xl"
                                    />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={32} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*" 
                            />
                        </div>
                        <p className="mt-3 text-xs text-slate-500 font-medium">Click to change avatar</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter your name..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                    placeholder="username"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-950/50 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || isUploading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};