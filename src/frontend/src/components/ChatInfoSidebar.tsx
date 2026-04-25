import { useState, useEffect } from 'react';
import { X, UserPlus, LogOut, ShieldCheck, UserMinus, Search, Loader2, Edit2, Check } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';
import { UserRole, ChatType, type UserDto } from '../types';
import { Avatar } from './Avatar'; // Импортируем компонент аватара

export const ChatInfoSidebar = ({ onClose }: { onClose: () => void }) => {
    const { activeChatDetails, removeMember, addMember, renameChat } = useChatStore();
    const { user: currentUser } = useAuthStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<UserDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (activeChatDetails) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNewName(activeChatDetails.title || '');
        }
    }, [activeChatDetails]);

    if (!activeChatDetails) return null;

    const isAdmin = activeChatDetails.members.find(m => m.userId === currentUser?.id)?.role === UserRole.Admin;
    const isGroup = activeChatDetails.type !== ChatType.Direct;

    // Определяем аватарку для заголовка чата
    const chatAvatarUrl = activeChatDetails.type === ChatType.Direct
        ? activeChatDetails.members.find(m => m.userId !== currentUser?.id)?.avatarUrl
        : undefined;

    const handleRename = async () => {
        if (!newName.trim() || newName === activeChatDetails.title) {
            setIsEditingName(false);
            return;
        }
        try {
            await renameChat(activeChatDetails.id, newName.trim());
            setIsEditingName(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Failed to rename chat");
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const users = await userApi.searchUsers(searchTerm);
                    const filtered = users.filter(u => 
                        !activeChatDetails.members.some(m => m.userId === u.id)
                    );
                    setSearchResults(filtered);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeChatDetails.members]);

    const handleAddMember = async (userId: string) => {
        try {
            await addMember(activeChatDetails.id, userId);
            setSearchTerm('');
            setSearchResults([]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert("Failed to add member");
        }
    };

    return (
        <aside className="w-80 h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h3 className="font-bold text-white tracking-tight">Chat Info</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* ГЛАВНЫЙ АВАТАР ЧАТА */}
                <div className="p-6 flex flex-col items-center border-b border-slate-800/50">
                    <Avatar 
                        url={chatAvatarUrl}
                        name={activeChatDetails.title || 'G'}
                        className="w-24 h-24 text-3xl mb-4 shadow-2xl ring-4 ring-slate-800/50"
                    />

                    <div className="w-full flex flex-col items-center group">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 w-full px-4">
                                <input 
                                    autoFocus
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                    className="flex-1 bg-slate-950 border border-blue-500 rounded-lg px-3 py-1 text-white text-center text-lg font-bold outline-none"
                                />
                                <button onClick={handleRename} className="p-1 text-green-500 hover:bg-green-500/10 rounded">
                                    <Check size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h4 className="text-xl font-bold text-white text-center">{activeChatDetails.title || "Chat"}</h4>
                                {isAdmin && isGroup && (
                                    <button 
                                        onClick={() => setIsEditingName(true)}
                                        className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
                        {activeChatDetails.members.length} participants
                    </p>
                </div>

                {/* ДОБАВЛЕНИЕ УЧАСТНИКОВ (ПОИСК) */}
                {isGroup && isAdmin && (
                    <div className="p-4 border-b border-slate-800/50">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Add New Member</p>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input 
                                type="text"
                                placeholder="Search by username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={14} />
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                                {searchResults.map(userResult => (
                                    <button 
                                        key={userResult.id}
                                        onClick={() => handleAddMember(userResult.id)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-indigo-600/10 text-left transition-colors border-b border-slate-800/50 last:border-0"
                                    >
                                        <Avatar 
                                            name={userResult.username}
                                            className="w-8 h-8 text-[10px]"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{userResult.username}</p>
                                            <p className="text-[10px] text-slate-500 truncate">@{userResult.username}</p>
                                        </div>
                                        <UserPlus size={16} className="text-indigo-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* СПИСОК УЧАСТНИКОВ */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Members</p>
                    </div>
                    <div className="space-y-1">
                        {activeChatDetails.members.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-800/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar 
                                            url={member.avatarUrl}
                                            name={member.fullname || member.username || '?'}
                                            className="w-10 h-10 text-sm ring-2 ring-slate-800 group-hover:ring-slate-700 transition-all"
                                        />
                                        {member.role === UserRole.Admin && (
                                            <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-0.5 z-10">
                                                <ShieldCheck size={12} className="text-amber-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-200 truncate">
                                            {member.fullname || member.username}
                                            {member.userId === currentUser?.id && <span className="ml-1 text-[10px] text-indigo-400 font-normal">(You)</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-500">@{member.username}</p>
                                    </div>
                                </div>

                                {isAdmin && member.userId !== currentUser?.id && (
                                    <button 
                                        onClick={() => removeMember(activeChatDetails.id, member.userId)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        title="Remove member"
                                    >
                                        <UserMinus size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isGroup && (
                <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                    <button 
                        onClick={() => {
                            if(window.confirm("Are you sure you want to leave this chat?")) {
                                removeMember(activeChatDetails.id, currentUser!.id);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-red-400/20"
                    >
                        <LogOut size={18} />
                        Leave Chat
                    </button>
                </div>
            )}
        </aside>
    );
};