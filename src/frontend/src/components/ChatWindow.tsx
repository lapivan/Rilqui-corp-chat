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
import { Loader2, Search, Lock, Pencil, Trash2, X, Pin, Reply as ReplyIcon } from 'lucide-react';
import type { MessageDto, ChatMemberDto } from '../types'; 
import { Avatar } from './Avatar';
import { PinnedMessagesBar } from './PinnedMessagesBar';

export const ChatWindow = () => {
    const { 
        activeChatId, chats, messages, pinnedMessages, fetchMessages, 
        hasMore, isLoading, initSignalR, disconnectFromChat,
        setChatDetails, resetUnreadCount, fetchChatDetails,
        currentChatDetails, setReplyToMessage
    } = useChatStore();
    
    const { user } = useAuthStore();
    const { canWrite, isChannel } = useChatPermissions(); 
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [editingMessage, setEditingMessage] = useState<MessageDto | null>(null);

    const currentChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

    useEffect(() => {
        if (activeChatId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialLoad(true);
            setEditingMessage(null); 
            setShowInfo(false);
            fetchMessages(activeChatId);
            initSignalR(activeChatId);
            fetchChatDetails(activeChatId);

            chatApi.markAsRead(activeChatId)
                .then(() => resetUnreadCount(activeChatId))
                .catch(console.error);
        }

        return () => {
            if (activeChatId) {
                disconnectFromChat(activeChatId);
                setChatDetails(null);
            }
        };
    }, [activeChatId, initSignalR, disconnectFromChat, fetchMessages, setChatDetails, resetUnreadCount, fetchChatDetails]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        
        if (isInitialLoad && messages.length > 0 && !isLoading) {
            container.scrollTop = container.scrollHeight;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsInitialLoad(false);
        } else if (!isInitialLoad && messages.length > 0) {
            const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
            if (isNearBottom) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [messages, isInitialLoad, isLoading]);

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        if (container.scrollTop === 0 && hasMore && !isLoading && messages.length > 0 && activeChatId) {
            const prevHeight = container.scrollHeight;
            const oldestMessageTimestamp = messages[0].createdAt;
            await fetchMessages(activeChatId, oldestMessageTimestamp);
            
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight - prevHeight;
            });
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm("Удалить это сообщение?")) {
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
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-blue-500/20');
            setTimeout(() => element.classList.remove('bg-blue-500/20'), 2000);
        }
    };

    const formatDateSeparator = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) return 'Сегодня';
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
        return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
    };

    if (!activeChatId) return (
        <div className="flex-1 flex items-center justify-center bg-slate-950/20">
            <p className="text-slate-500">Выберите чат для начала общения</p>
        </div>
    );

    return (
        <div className="flex-1 flex overflow-hidden bg-[#0b1120]">
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/30 backdrop-blur-sm z-30">
                    <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowInfo(!showInfo)}
                    >
                        <Avatar 
                            url={currentChatDetails?.members?.find((m: ChatMemberDto) => m.userId !== user?.id)?.avatarUrl} 
                            name={currentChat?.title || 'C'} 
                            className="w-10 h-10 text-sm"
                        />
                        <div>
                            <h3 className="text-sm font-bold text-white">{currentChat?.title || 'Чат'}</h3>
                            <p className="text-[10px] text-green-500">в сети</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-lg transition-colors ${isSearchOpen ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Search size={20} />
                    </button>
                </div>

                <PinnedMessagesBar 
                    messages={pinnedMessages} 
                    onUnpin={(id) => {
                        const msg = pinnedMessages.find(m => m.id === id);
                        if (msg) handleTogglePin(msg);
                    }}
                    onJump={scrollToMessage}
                />

                {isSearchOpen && (
                    <ChatSearch 
                        chatId={activeChatId} 
                        onClose={() => setIsSearchOpen(false)} 
                    />
                )}
                
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-slate-900
                    [&::-webkit-scrollbar-thumb]:bg-slate-700
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
                >
                    {isLoading && hasMore && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const prevMsg = messages[idx - 1];
                        const isSameSender = prevMsg?.senderId === msg.senderId;
                        
                        const currentDate = new Date(msg.createdAt).toDateString();
                        const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                        const showDateSeparator = currentDate !== prevDate;

                        const senderInfo = currentChatDetails?.members?.find((m: ChatMemberDto) => m.userId === msg.senderId);

                        return (
                            <div key={msg.id} id={`msg-${msg.id}`} className="transition-colors duration-500 rounded-lg">
                                {showDateSeparator && (
                                    <div className="flex justify-center my-6">
                                        <span className="px-3 py-1 rounded-full bg-slate-800/50 text-slate-400 text-[11px] font-medium backdrop-blur-sm border border-slate-700/30">
                                            {formatDateSeparator(msg.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div className={`flex group items-end ${isMe ? 'justify-end' : 'justify-start'} ${isSameSender && !showDateSeparator ? 'mt-1' : 'mt-4'}`}>
                                    
                                    {!isMe && (
                                        <div className="w-8 flex-shrink-0 mr-2">
                                            {(!isSameSender || showDateSeparator) && (
                                                <Avatar 
                                                    url={senderInfo?.avatarUrl} 
                                                    name={msg.senderName || '?'} 
                                                    className="w-8 h-8 text-[10px]"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={`hidden group-hover:flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 ${isMe ? 'mr-2 order-first self-center' : 'ml-2 self-center'}`}>
                                        <button 
                                            onClick={() => setReplyToMessage(msg)} 
                                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"
                                            title="Ответить"
                                        >
                                            <ReplyIcon size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleTogglePin(msg)}
                                            className={`p-1.5 hover:bg-slate-800 rounded transition-colors ${msg.isPinned ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                                            title={msg.isPinned ? "Открепить" : "Закрепить"}
                                        >
                                            <Pin size={14} className={msg.isPinned ? 'fill-current' : ''} />
                                        </button>
                                        
                                        {isMe && (
                                            <>
                                                <button 
                                                    onClick={() => setEditingMessage(msg)}
                                                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400"
                                                    title="Редактировать"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400"
                                                    title="Удалить"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className={`max-w-[70%] lg:max-w-[60%] relative px-4 py-2 rounded-2xl shadow-sm ${
                                        isMe 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50'
                                    }`}>
                                        {msg.isPinned && (
                                            <div className="flex items-center gap-1 text-[9px] text-blue-300 mb-1">
                                                <Pin size={10} className="fill-current" />
                                                <span>Pinned</span>
                                            </div>
                                        )}
                                        {!isMe && (!isSameSender || showDateSeparator) && (
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 block">
                                                {msg.senderName}
                                            </span>
                                        )}
                                        {msg.parentMessageId && (
                                            <div 
                                                onClick={() => scrollToMessage(msg.parentMessageId!)}
                                                className="mb-2 p-2 bg-black/20 border-l-2 border-blue-500 rounded cursor-pointer hover:bg-black/30 transition-colors overflow-hidden"
                                            >
                                                <p className="text-[10px] font-bold text-blue-400 uppercase">
                                                    Ответ на сообщение
                                                </p>
                                                <p className="text-xs text-slate-300 truncate">
                                                    {messages.find(m => m.id === msg.parentMessageId)?.content || "Сообщение..."}
                                                </p>
                                            </div>
                                        )}
                                        <MessageContent message={msg} />
                                        <div className={`text-[10px] mt-1 opacity-50 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="z-20">
                    {editingMessage && (
                        <div className="px-6 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Pencil size={12} />
                                <span>Редактирование...</span>
                            </div>
                            <button onClick={() => setEditingMessage(null)} className="text-slate-500 hover:text-white">
                                <X size={14} />
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
                        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500 italic text-sm">
                            <Lock size={14} />
                            {isChannel ? "Только администраторы могут писать" : "Отправка сообщений ограничена"}
                        </div>
                    )}
                </div>
            </div>
            {showInfo && <ChatInfoSidebar onClose={() => setShowInfo(false)} />}
        </div>
    );
};