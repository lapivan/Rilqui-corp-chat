import { useEffect, useRef, useState, useMemo } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useChatPermissions } from '../hooks/useChatPermissions';
import { chatApi } from '../api/chatApi';
import { messageApi } from '../api/messageApi';
import { MessageContent } from './MessageContent';
import { ChatSearch } from './ChatSearch';
import { MessageInput } from './MessageInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import {
    Loader2,
    Search,
    Lock,
    Pencil,
    Trash2,
    X,
    Pin,
    Reply as ReplyIcon
} from 'lucide-react';

import { type MessageDto, type ChatMemberDto, ChatType } from '../types';
import { Avatar } from './Avatar';
import { PinnedMessagesBar } from './PinnedMessagesBar';

export const ChatWindow = () => {
    const {
        activeChatId,
        chats,
        messages,
        pinnedMessages,
        fetchMessages,
        hasMore,
        isLoading,
        initSignalR,
        setChatDetails,
        resetUnreadCount,
        currentChatDetails,
        setReplyToMessage
    } = useChatStore();

    const { user } = useAuthStore();
    const { canWrite, isChannel } = useChatPermissions();

    const scrollRef = useRef<HTMLDivElement>(null);

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [editingMessage, setEditingMessage] = useState<MessageDto | null>(null);

    const currentChat = useMemo(
        () => chats.find(c => c.id === activeChatId),
        [chats, activeChatId]
    );

    useEffect(() => {
        initSignalR();
    }, [initSignalR]);

    useEffect(() => {
        if (activeChatId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialLoad(true);
            setEditingMessage(null);
            setShowInfo(false);

            chatApi
                .markAsRead(activeChatId)
                .then(() => resetUnreadCount(activeChatId))
                .catch(console.error);
        }

        return () => {
            if (activeChatId) {
                setChatDetails(null);
            }
        };
    }, [activeChatId, setChatDetails, resetUnreadCount]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        if (isInitialLoad && messages.length > 0 && !isLoading) {
            container.scrollTop = container.scrollHeight;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialLoad(false);
        } else if (!isInitialLoad && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const isMyMessage = lastMessage?.senderId === user?.id;

            const isNearBottom =
                container.scrollHeight - container.scrollTop <=
                container.clientHeight + 120;

            if (isMyMessage || isNearBottom) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages, isInitialLoad, isLoading, user?.id]);

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;

        if (
            container.scrollTop === 0 &&
            hasMore &&
            !isLoading &&
            messages.length > 0 &&
            activeChatId
        ) {
            const prevHeight = container.scrollHeight;
            const oldestMessageTimestamp = messages[0].createdAt;

            await fetchMessages(activeChatId, oldestMessageTimestamp);

            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight - prevHeight;
            });
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm('Удалить это сообщение?')) {
            try {
                await messageApi.deleteMessage(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleTogglePin = async (message: MessageDto) => {
        try {
            if (message.isPinned) {
                await messageApi.unpinMessage(message.id);
            } else {
                await messageApi.pinMessage(message.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`msg-${messageId}`);

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            element.classList.add('bg-blue-500/10');

            setTimeout(() => {
                element.classList.remove('bg-blue-500/10');
            }, 2000);
        }
    };

    const formatDateSeparator = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) return 'Сегодня';

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        if (date.toDateString() === yesterday.toDateString()) return 'Вчера';

        return date.toLocaleDateString([], {
            day: 'numeric',
            month: 'long'
        });
    };

    if (!activeChatId) {
        return (
            <div className="flex flex-1 items-center justify-center bg-[#020817]">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-6 py-4 shadow-xl backdrop-blur-xl">
                    <p className="text-xs font-medium tracking-wide text-slate-400">
                        Выберите чат для начала общения
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 overflow-hidden bg-[#020817]">
            <div className="relative flex h-full min-w-0 flex-1 flex-col">
                {/* HEADER */}
                <div className="z-30 flex h-[60px] items-center justify-between border-b border-slate-800/80 bg-slate-950/70 px-4 backdrop-blur-2xl">
                    <div
                        className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        <Avatar
                            url={
                                currentChat?.type === ChatType.Direct
                                    ? currentChatDetails?.members?.find(
                                          (m: ChatMemberDto) =>
                                              m.userId !== user?.id
                                      )?.avatarUrl
                                    : currentChat?.avatarUrl
                            }
                            name={currentChat?.title || 'C'}
                            className="h-8 w-8 border border-slate-700/70 text-[10px] shadow-lg"
                        />

                        <div className="space-y-0">
                            <h3 className="text-[13px] font-semibold tracking-wide text-white">
                                {currentChat?.title || 'Чат'}
                            </h3>

                            <p className="text-[10px] text-slate-500">
                                Secure messaging
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`rounded-lg border p-2 transition-all duration-200 ${
                            isSearchOpen
                                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10'
                                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                    >
                        <Search size={15} />
                    </button>
                </div>

                <PinnedMessagesBar
                    messages={pinnedMessages}
                    onUnpin={id => {
                        const msg = pinnedMessages.find(m => m.id === id);

                        if (msg) handleTogglePin(msg);
                    }}
                    onJump={scrollToMessage}
                />

                {isSearchOpen && (
                    <ChatSearch
                        chatId={activeChatId}
                        onClose={() => setIsSearchOpen(false)}
                        onMessageJump={scrollToMessage}
                    />
                )}

                {/* BODY */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:bg-slate-700/70
                    hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                >
                    {isLoading && isInitialLoad ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <>
                            {isLoading && hasMore && (
                                <div className="flex justify-center py-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;

                                const prevMsg = messages[idx - 1];
                                const isSameSender =
                                    prevMsg?.senderId === msg.senderId;

                                const currentDate = new Date(
                                    msg.createdAt
                                ).toDateString();

                                const prevDate = prevMsg
                                    ? new Date(
                                          prevMsg.createdAt
                                      ).toDateString()
                                    : null;

                                const showDateSeparator =
                                    currentDate !== prevDate;

                                const senderInfo =
                                    currentChatDetails?.members?.find(
                                        (m: ChatMemberDto) =>
                                            m.userId === msg.senderId
                                    );

                                return (
                                    <div
                                        key={msg.id}
                                        id={`msg-${msg.id}`}
                                        className="rounded-lg transition-colors duration-500"
                                    >
                                        {showDateSeparator && (
                                            <div className="my-3 flex justify-center">
                                                <span className="rounded-full border border-slate-700/50 bg-slate-900/80 px-2 py-0.5 text-[9px] font-medium text-slate-400 shadow-lg backdrop-blur-xl">
                                                    {formatDateSeparator(
                                                        msg.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            className={`group flex items-end ${
                                                isMe
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            } ${
                                                isSameSender &&
                                                !showDateSeparator
                                                    ? 'mt-0.5'
                                                    : 'mt-1.5'
                                            }`}
                                        >
                                            {!isMe && (
                                                <div className="mr-2 w-7 flex-shrink-0">
                                                    {(!isSameSender ||
                                                        showDateSeparator) && (
                                                        <Avatar
                                                            url={
                                                                senderInfo?.avatarUrl
                                                            }
                                                            name={
                                                                msg.senderName ||
                                                                '?'
                                                            }
                                                            className="h-7 w-7 border border-slate-700/50 text-[9px]"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                className={`hidden items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:flex group-hover:opacity-100 ${
                                                    isMe
                                                        ? 'order-first mr-1'
                                                        : 'ml-1'
                                                }`}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setReplyToMessage(msg)
                                                    }
                                                    className="rounded-md border border-slate-800 bg-slate-900/80 p-1 text-slate-400 transition-all hover:border-slate-700 hover:text-blue-400"
                                                >
                                                    <ReplyIcon size={10} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleTogglePin(msg)
                                                    }
                                                    className={`rounded-md border border-slate-800 bg-slate-900/80 p-1 transition-all ${
                                                        msg.isPinned
                                                            ? 'text-blue-400'
                                                            : 'text-slate-400 hover:text-blue-400'
                                                    }`}
                                                >
                                                    <Pin
                                                        size={10}
                                                        className={
                                                            msg.isPinned
                                                                ? 'fill-current'
                                                                : ''
                                                        }
                                                    />
                                                </button>

                                                {isMe && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                setEditingMessage(
                                                                    msg
                                                                )
                                                            }
                                                            className="rounded-md border border-slate-800 bg-slate-900/80 p-1 text-slate-400 transition-all hover:text-blue-400"
                                                        >
                                                            <Pencil size={10} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleDeleteMessage(
                                                                    msg.id
                                                                )
                                                            }
                                                            className="rounded-md border border-slate-800 bg-slate-900/80 p-1 text-slate-400 transition-all hover:text-red-400"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <div
                                                className={`relative max-w-[58%] rounded-xl border px-2.5 py-2 shadow-lg backdrop-blur-sm transition-all duration-200 lg:max-w-[46%]
                                                ${
                                                    isMe
                                                        ? 'rounded-br-sm border-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                                                        : 'rounded-bl-sm border-slate-700/60 bg-slate-900/90 text-slate-100'
                                                }`}
                                            >
                                                {msg.isPinned && (
                                                    <div className="mb-0.5 flex items-center gap-1 text-[8px] text-blue-300">
                                                        <Pin
                                                            size={8}
                                                            className="fill-current"
                                                        />
                                                        <span>Закреплено</span>
                                                    </div>
                                                )}

                                                {!isMe &&
                                                    (!isSameSender ||
                                                        showDateSeparator) && (
                                                        <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.12em] text-blue-400">
                                                            {msg.senderName}
                                                        </span>
                                                    )}

                                                {msg.parentMessageId && (
                                                    <div
                                                        onClick={() =>
                                                            scrollToMessage(
                                                                msg.parentMessageId!
                                                            )
                                                        }
                                                        className="mb-1 cursor-pointer overflow-hidden rounded-lg border border-slate-700/60 bg-black/20 p-1.5 transition-colors hover:bg-black/30"
                                                    >
                                                        <p className="text-[8px] font-semibold uppercase tracking-wide text-blue-400">
                                                            Ответ
                                                        </p>

                                                        <p className="truncate text-[10px] text-slate-300">
                                                            {messages.find(
                                                                m =>
                                                                    m.id ===
                                                                    msg.parentMessageId
                                                            )?.content ||
                                                                'Сообщение...'}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="text-[11px] leading-snug tracking-normal">
                                                    <MessageContent
                                                        message={msg}
                                                    />
                                                </div>

                                                <div
                                                    className={`mt-1 flex items-center text-[8px] opacity-60 ${
                                                        isMe
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    }`}
                                                >
                                                    {new Date(
                                                        msg.createdAt
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* INPUT */}
                <div className="z-20 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-2xl">
                    {editingMessage && (
                        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-[10px]">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Pencil size={10} />
                                <span>Редактирование сообщения</span>
                            </div>

                            <button
                                onClick={() => setEditingMessage(null)}
                                className="text-slate-500 transition-colors hover:text-white"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {canWrite ? (
                        <MessageInput
                            chatId={activeChatId}
                            editMode={editingMessage}
                            onEditComplete={() => setEditingMessage(null)}
                        />
                    ) : (
                        <div className="flex items-center justify-center gap-2 px-4 py-4 text-xs italic text-slate-500">
                            <Lock size={12} />

                            {isChannel
                                ? 'Только администраторы могут писать'
                                : 'Отправка сообщений ограничена'}
                        </div>
                    )}
                </div>
            </div>

            {showInfo && (
                <ChatInfoSidebar onClose={() => setShowInfo(false)} />
            )}
        </div>
    );
};