import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Settings,
    Users,
    X,
    Loader2,
    Plus
} from 'lucide-react';

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
    const {
        chats,
        activeChatId,
        setActiveChat,
        isLoading: chatsLoading,
        createDirectChat,
        fetchChats
    } = useChatStore();

    const { user: currentUser } = useAuthStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] =
        useState<TabType>('All');

    const debouncedSearch = useDebounce(
        searchTerm,
        400
    );

    const [searchResults, setSearchResults] =
        useState<UserDto[]>([]);

    const [isSearching, setIsSearching] =
        useState(false);

    const [isCreatingChat, setIsCreatingChat] =
        useState(false);

    const [isSettingsOpen, setIsSettingsOpen] =
        useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchChats();
        }
    }, [currentUser, fetchChats]);

    useEffect(() => {
        const performSearch = async () => {
            if (
                debouncedSearch.trim().length < 2
            ) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);

            try {
                const users =
                    await userApi.searchUsers(
                        debouncedSearch
                    );

                setSearchResults(
                    users.filter(
                        u =>
                            u.id !==
                            currentUser?.id
                    )
                );
            } catch (error) {
                console.error(
                    'Search failed',
                    error
                );

                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [debouncedSearch, currentUser?.id]);

    const filteredChats = useMemo(() => {
        const getChatTimestamp = (
            chat: typeof chats[0]
        ) => {
            return chat.lastMessage
                ? new Date(
                      chat.lastMessage.createdAt
                  ).getTime()
                : new Date(
                      chat.updatedAt
                  ).getTime();
        };

        const sorted = [...chats].sort(
            (a, b) =>
                getChatTimestamp(b) -
                getChatTimestamp(a)
        );

        if (activeTab === 'Personal') {
            return sorted.filter(
                chat =>
                    chat.type ===
                    ChatType.Direct
            );
        }

        if (activeTab === 'Groups') {
            return sorted.filter(
                chat =>
                    chat.type ===
                        ChatType.Group ||
                    chat.type ===
                        ChatType.Channel
            );
        }

        return sorted;
    }, [chats, activeTab]);

    const handleSelectUser = async (
        user: UserDto
    ) => {
        setIsCreatingChat(true);

        try {
            await createDirectChat(user.id);
            setSearchTerm('');
        } catch (error) {
            console.error(
                'Failed to create chat',
                error
            );
        } finally {
            setIsCreatingChat(false);
        }
    };

    return (
        <>
            <aside className="z-20 flex h-full w-[300px] flex-col border-r border-slate-800/70 bg-slate-950/80 backdrop-blur-2xl lg:w-[340px]">
                {/* HEADER */}
                <div className="border-b border-slate-800/60 px-4 py-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div
                                onClick={() =>
                                    setIsSettingsOpen(
                                        true
                                    )
                                }
                                className="cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 shadow-lg transition-all hover:border-blue-500/40"
                            >
                                <Avatar
                                    url={
                                        currentUser?.avatarUrl
                                    }
                                    name={
                                        currentUser?.fullname ||
                                        'U'
                                    }
                                    className="h-9 w-9"
                                />
                            </div>

                            <div>
                                <h2 className="text-[15px] font-semibold tracking-wide text-white">
                                    Corporate Chat
                                </h2>

                                <p className="text-[11px] text-slate-500">
                                    Internal communication
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() =>
                                    setIsCreateModalOpen(
                                        true
                                    )
                                }
                                className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-blue-400 transition-all hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                            >
                                <Plus size={15} />
                            </button>

                            <button
                                onClick={() =>
                                    setIsSettingsOpen(
                                        true
                                    )
                                }
                                className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                            >
                                <Settings size={15} />
                            </button>
                        </div>
                    </div>

                    {/* SEARCH */}
                    <div className="group relative">
                        <Search
                            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                                searchTerm
                                    ? 'text-blue-400'
                                    : 'text-slate-500'
                            }`}
                            size={14}
                        />

                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={e =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-9 text-[13px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/5"
                        />

                        {searchTerm && (
                            <button
                                onClick={() =>
                                    setSearchTerm('')
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {!searchTerm && (
                    <div className="flex gap-4 border-b border-slate-800/60 px-4 pt-3">
                        {(
                            [
                                'All',
                                'Personal',
                                'Groups'
                            ] as TabType[]
                        ).map(tab => (
                            <button
                                key={tab}
                                onClick={() =>
                                    setActiveTab(tab)
                                }
                                className={`relative pb-3 text-[12px] font-medium transition-all
                                ${
                                    activeTab === tab
                                        ? 'text-blue-400'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {tab}

                                {activeTab ===
                                    tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-400" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* CONTENT */}
                <div className="custom-scrollbar flex-1 overflow-y-auto py-2">
                    {searchTerm ? (
                        <div className="space-y-1">
                            <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                Global Search
                            </div>

                            {isSearching ? (
                                <div className="flex justify-center p-6">
                                    <Loader2 className="animate-spin text-blue-500" />
                                </div>
                            ) : searchResults.length >
                              0 ? (
                                searchResults.map(
                                    user => (
                                        <SearchResultItem
                                            key={
                                                user.id
                                            }
                                            user={
                                                user
                                            }
                                            isCreating={
                                                isCreatingChat
                                            }
                                            onClick={() =>
                                                handleSelectUser(
                                                    user
                                                )
                                            }
                                        />
                                    )
                                )
                            ) : (
                                <div className="px-4 py-8 text-center text-xs text-slate-500">
                                    {searchTerm.length <
                                    2
                                        ? 'Type at least 2 characters'
                                        : 'User not found'}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {chatsLoading ? (
                                <div className="space-y-3 p-4">
                                    {[1, 2, 3, 4, 5].map(
                                        i => (
                                            <div
                                                key={
                                                    i
                                                }
                                                className="flex animate-pulse gap-2.5 opacity-40"
                                            >
                                                <div className="h-9 w-9 rounded-xl bg-slate-800" />

                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-2.5 w-1/3 rounded bg-slate-800" />

                                                    <div className="h-2.5 w-2/3 rounded bg-slate-800" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : filteredChats.length >
                              0 ? (
                                filteredChats.map(
                                    chat => (
                                        <ChatListItem
                                            key={
                                                chat.id
                                            }
                                            chat={
                                                chat
                                            }
                                            isActive={
                                                activeChatId ===
                                                chat.id
                                            }
                                            onClick={() =>
                                                setActiveChat(
                                                    chat.id
                                                )
                                            }
                                        />
                                    )
                                )
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center space-y-3 px-6 text-center text-slate-600">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70">
                                        <Users
                                            size={
                                                22
                                            }
                                            className="opacity-30"
                                        />
                                    </div>

                                    <p className="text-xs">
                                        No{' '}
                                        {activeTab.toLowerCase()}{' '}
                                        conversations
                                        yet.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </aside>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() =>
                    setIsSettingsOpen(false)
                }
            />

            <CreateChatModal
                isOpen={isCreateModalOpen}
                onClose={() =>
                    setIsCreateModalOpen(false)
                }
            />
        </>
    );
};