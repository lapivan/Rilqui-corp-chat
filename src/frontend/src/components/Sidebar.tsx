import { useState, useEffect, useMemo } from 'react';
import { Search, Settings, Users, X, Loader2, Plus } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ChatListItem } from '../components/ChatListItem';
import { SearchResultItem } from '../components/SearchResultItem';
import { useDebounce } from '../hooks/useDebounce';
import { userApi } from '../api/userApi';
import type { UserDto } from '../types';
import { SettingsModal } from './SettingsModal';
import { CreateChatModal } from '../components/CreateChatModal';
import { Avatar } from './Avatar';
import { ChatType } from '../types';

type TabType = 'All' | 'Personal' | 'Groups';

export const Sidebar = () => {
    const { chats, activeChatId, setActiveChat, isLoading: chatsLoading, createDirectChat, fetchChats } = useChatStore();
    const { user: currentUser } = useAuthStore();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const debouncedSearch = useDebounce(searchTerm, 400);
    
    const [searchResults, setSearchResults] = useState<UserDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingChat, setIsCreatingChat] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchChats();
        }
    }, [currentUser, fetchChats]);

    useEffect(() => {
        const performSearch = async () => {
            // Исправляем UX: если меньше 2 символов, просто очищаем результаты и не делаем запрос
            if (debouncedSearch.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            
            setIsSearching(true);
            try {
                const users = await userApi.searchUsers(debouncedSearch);
                setSearchResults(users.filter(u => u.id !== currentUser?.id));
            } catch (error) {
                console.error("Search failed", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedSearch, currentUser?.id]);

    // Логика фильтрации и хронологической сортировки вкладок
    const filteredChats = useMemo(() => {
        // Вспомогательная функция для получения таймстемпа чата
        const getChatTimestamp = (chat: typeof chats[0]) => {
            return chat.lastMessage 
                ? new Date(chat.lastMessage.createdAt).getTime() 
                : new Date(chat.updatedAt).getTime();
        };

        // Сортируем: от самых свежих (больший таймстемп) к старым
        const sorted = [...chats].sort((a, b) => getChatTimestamp(b) - getChatTimestamp(a));

        if (activeTab === 'Personal') {
            return sorted.filter(chat => chat.type === ChatType.Direct);
        }
        if (activeTab === 'Groups') {
            return sorted.filter(chat => chat.type === ChatType.Group || chat.type === ChatType.Channel);
        }
        return sorted;
    }, [chats, activeTab]);

    const handleSelectUser = async (user: UserDto) => {
        setIsCreatingChat(true);
        try {
            await createDirectChat(user.id);
            setSearchTerm('');
        } catch (error) {
            console.error("Failed to create chat", error);
        } finally {
            setIsCreatingChat(false);
        }
    };

    return (
        <>
            <aside className="w-80 lg:w-[380px] h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20">
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div 
                                onClick={() => setIsSettingsOpen(true)}
                                className="cursor-pointer hover:ring-2 ring-blue-500 transition-all shadow-lg rounded-xl overflow-hidden flex-shrink-0"
                            >
                                <Avatar 
                                    url={currentUser?.avatarUrl} 
                                    name={currentUser?.fullname || 'U'} 
                                    className="w-10 h-10 rounded-xl"
                                />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="p-2 text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-lg transition-all"
                            >
                                <Plus size={20} />
                            </button>
                            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-400' : 'text-slate-500'}`} size={18} />
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 text-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-10 outline-none transition-all focus:ring-4 focus:ring-blue-500/5"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {!searchTerm && (
                    <div className="flex px-4 gap-6 border-b border-slate-800/50 overflow-x-auto no-scrollbar">
                        {(['All', 'Personal', 'Groups'] as TabType[]).map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 text-sm font-semibold transition-all relative ${activeTab === tab ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                    {searchTerm ? (
                        <div className="space-y-1">
                            <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Global Search</div>
                            {isSearching ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <SearchResultItem 
                                        key={user.id} 
                                        user={user} 
                                        isCreating={isCreatingChat}
                                        onClick={() => handleSelectUser(user)} 
                                    />
                                ))
                            ) : (
                                <div className="text-center p-8 text-slate-500 text-sm">
                                    {searchTerm.length < 2 ? 'Type at least 2 characters' : 'User not found'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {chatsLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse opacity-50">
                                            <div className="w-12 h-12 bg-slate-800 rounded-full" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-3 bg-slate-800 rounded w-1/3" />
                                                <div className="h-3 bg-slate-800 rounded w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredChats.length > 0 ? (
                                filteredChats.map(chat => (
                                    <ChatListItem 
                                        key={chat.id}
                                        chat={chat}
                                        isActive={activeChatId === chat.id}
                                        onClick={() => setActiveChat(chat.id)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 px-8 text-center space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                                        <Users size={32} className="opacity-20" />
                                    </div>
                                    <p className="text-sm">No {activeTab.toLowerCase()} conversations yet.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <CreateChatModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </>
    );
};