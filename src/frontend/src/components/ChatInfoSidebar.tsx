import { useState, useEffect } from 'react';
import {
    X,
    UserPlus,
    LogOut,
    ShieldCheck,
    UserMinus,
    Search,
    Loader2,
    Edit2,
    Check
} from 'lucide-react';

import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/userApi';

import { UserRole, ChatType, type UserDto } from '../types';

import { Avatar } from './Avatar';

export const ChatInfoSidebar = ({
    onClose
}: {
    onClose: () => void;
}) => {
    const {
        activeChatDetails,
        removeMember,
        addMember,
        renameChat
    } = useChatStore();

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

    const isAdmin =
        activeChatDetails.members.find(
            m => m.userId === currentUser?.id
        )?.role === UserRole.Admin;

    const isGroup =
        activeChatDetails.type !== ChatType.Direct;

    const chatAvatarUrl =
        activeChatDetails.type === ChatType.Direct
            ? activeChatDetails.members.find(
                  m => m.userId !== currentUser?.id
              )?.avatarUrl
            : undefined;

    const handleRename = async () => {
        if (
            !newName.trim() ||
            newName === activeChatDetails.title
        ) {
            setIsEditingName(false);
            return;
        }

        try {
            await renameChat(
                activeChatDetails.id,
                newName.trim()
            );

            setIsEditingName(false);
        } catch {
            alert('Failed to rename chat');
        }
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length >= 2) {
                setIsSearching(true);

                try {
                    const users = await userApi.searchUsers(
                        searchTerm
                    );

                    const filtered = users.filter(
                        u =>
                            !activeChatDetails.members.some(
                                m => m.userId === u.id
                            )
                    );

                    setSearchResults(filtered);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeChatDetails.members]);

    const handleAddMember = async (
        userId: string
    ) => {
        try {
            await addMember(activeChatDetails.id, userId);

            setSearchTerm('');
            setSearchResults([]);
        } catch {
            alert('Failed to add member');
        }
    };

    return (
        <aside className="flex h-full w-[380px] flex-col border-l border-slate-800/70 bg-slate-950/90 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-right duration-300">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-800/70 px-5 py-4">
                <div>
                    <h3 className="text-[15px] font-semibold tracking-wide text-white">
                        Chat Details
                    </h3>

                    <p className="text-xs text-slate-500">
                        Workspace information
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                    <X size={17} />
                </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto">
                {/* TOP SECTION */}
                <div className="border-b border-slate-800/60 px-6 py-8">
                    <div className="flex flex-col items-center">
                        <Avatar
                            url={chatAvatarUrl}
                            name={activeChatDetails.title || 'G'}
                            className="h-28 w-28 border border-slate-700/60 text-3xl shadow-2xl"
                        />

                        <div className="group mt-5 w-full">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={newName}
                                        onChange={e =>
                                            setNewName(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={e =>
                                            e.key === 'Enter' &&
                                            handleRename()
                                        }
                                        className="flex-1 rounded-2xl border border-blue-500/40 bg-slate-900 px-4 py-3 text-center text-lg font-semibold text-white outline-none focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        onClick={handleRename}
                                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 transition-all hover:bg-emerald-500/20"
                                    >
                                        <Check size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <h4 className="text-center text-2xl font-semibold tracking-wide text-white">
                                        {activeChatDetails.title ||
                                            'Chat'}
                                    </h4>

                                    {isAdmin && isGroup && (
                                        <button
                                            onClick={() =>
                                                setIsEditingName(
                                                    true
                                                )
                                            }
                                            className="rounded-lg p-1 text-slate-500 opacity-0 transition-all hover:bg-slate-800 hover:text-white group-hover:opacity-100"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-3 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                                {
                                    activeChatDetails.members
                                        .length
                                }{' '}
                                participants
                            </p>
                        </div>
                    </div>
                </div>

                {/* ADD MEMBER */}
                {isGroup && isAdmin && (
                    <div className="border-b border-slate-800/60 px-5 py-5">
                        <div className="mb-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Add Members
                            </p>
                        </div>

                        <div className="relative">
                                                <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            size={13}
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
                                className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 py-3 pl-11 pr-11 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5"
                            />

                            {isSearching && (
                                <Loader2
                                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-400"
                                size={13}
                            />
                            )}
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                                {searchResults.map(
                                    userResult => (
                                        <button
                                            key={
                                                userResult.id
                                            }
                                            onClick={() =>
                                                handleAddMember(
                                                    userResult.id
                                                )
                                            }
                                            className="flex w-full items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-left transition-all hover:bg-blue-500/5 last:border-0"
                                        >
                                            <Avatar
                                                name={
                                                    userResult.username
                                                }
                                                className="h-9 w-9 text-xs"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-200">
                                                    {
                                                        userResult.username
                                                    }
                                                </p>

                                                <p className="truncate text-xs text-slate-500">
                                                    @
                                                    {
                                                        userResult.username
                                                    }
                                                </p>
                                            </div>

                                            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400">
                                                <UserPlus
                                                    size={15}
                                                />
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* MEMBERS */}
                <div className="px-5 py-5">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Team Members
                        </p>
                    </div>

                    <div className="space-y-2">
                        {activeChatDetails.members.map(
                            member => (
                                <div
                                    key={member.userId}
                                    className="group flex items-center justify-between rounded-2xl border border-transparent bg-slate-900/40 px-3 py-3 transition-all hover:border-slate-700/50 hover:bg-slate-900/80"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative">
                                            <Avatar
                                                url={
                                                    member.avatarUrl
                                                }
                                                name={
                                                    member.fullname ||
                                                    member.username ||
                                                    '?'
                                                }
                                                className="h-11 w-11 border border-slate-700/50 text-sm"
                                            />

                                            {member.role ===
                                                UserRole.Admin && (
                                                <div className="absolute -right-1 -top-1 rounded-full border border-slate-900 bg-amber-400 p-1 text-slate-950 shadow-lg">
                                                    <ShieldCheck
                                                        size={
                                                            10
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-100">
                                                {member.fullname ||
                                                    member.username}

                                                {member.userId ===
                                                    currentUser?.id && (
                                                    <span className="ml-1 text-[11px] font-normal text-blue-400">
                                                        (You)
                                                    </span>
                                                )}
                                            </p>

                                            <p className="truncate text-xs text-slate-500">
                                                @
                                                {
                                                    member.username
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {isAdmin &&
                                        member.userId !==
                                            currentUser?.id && (
                                            <button
                                                onClick={() =>
                                                    removeMember(
                                                        activeChatDetails.id,
                                                        member.userId
                                                    )
                                                }
                                                className="rounded-xl border border-transparent p-2 text-slate-500 opacity-0 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                                                title="Remove member"
                                            >
                                                <UserMinus
                                                    size={15}
                                                />
                                            </button>
                                        )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            {isGroup && (
                <div className="border-t border-slate-800/70 bg-slate-950/80 p-5">
                    <button
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to leave this chat?'
                                )
                            ) {
                                removeMember(
                                    activeChatDetails.id,
                                    currentUser!.id
                                );
                            }
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
                    >
                        <LogOut size={17} />
                        Leave Chat
                    </button>
                </div>
            )}
        </aside>
    );
};