import { create } from 'zustand';
import type { ChatDetailDto, ChatSummaryDto, MessageDto } from '../types';
import * as signalR from '@microsoft/signalr';
import { messageApi } from '../api/messageApi';
import { ChatType } from '../types';
import { chatApi } from '../api/chatApi';
import { useAuthStore } from './authStore';
import { useMessageStore } from './messageStore';

interface ChatState {
    chats: ChatSummaryDto[];
    messages: MessageDto[];
    pinnedMessages: MessageDto[];
    connection: signalR.HubConnection | null;
    hasMore: boolean;
    activeChatId: string | null;
    isLoading: boolean;
    currentChatDetails: ChatDetailDto | null;
    activeChatDetails: ChatDetailDto | null;
    
    setChats: (chats: ChatSummaryDto[]) => void;
    setChatDetails: (details: ChatDetailDto | null) => void;
    setActiveChat: (chatId: string | null) => void;
    updateChatLastMessage: (chatId: string, lastMessage: MessageDto) => void;
    incrementUnreadCount: (chatId: string) => void;
    resetUnreadCount: (chatId: string) => void;
    setLoading: (loading: boolean) => void;
    initSignalR: () => Promise<void>;
    disconnectFromChat: (chatId: string) => Promise<void>;
    addMessage: (message: MessageDto) => void;
    fetchChats: () => Promise<void>;
    fetchMessages: (chatId: string, before?: string) => Promise<void>;
    fetchPinnedMessages: (chatId: string) => Promise<void>; // Метод получения закрепов
    createDirectChat: (partnerId: string) => Promise<void>;
    createGroupOrChannel: (chatName: string, type: ChatType) => Promise<void>;
    fetchChatDetails: (chatId: string) => Promise<void>;
    renameChat: (chatId: string, newName: string) => Promise<void>;
    addMember: (chatId: string, userId: string) => Promise<void>;
    removeMember: (chatId: string, userId: string) => Promise<void>;
    replyToMessage: MessageDto | null;
    setReplyToMessage: (message: MessageDto | null) => void;
    sendTyping: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    activeChatId: null,
    isLoading: false,
    messages: [],
    pinnedMessages: [],
    connection: null,
    hasMore: true,
    currentChatDetails: null,
    activeChatDetails: null,

    setChatDetails: (details) => set({ currentChatDetails: details }),
    setChats: (chats) => set({ chats }),
    
    setActiveChat: async (chatId: string) => {
        const oldChatId = get().activeChatId;
        const conn = get().connection;
    
        set({ activeChatId: chatId, messages: [], pinnedMessages: [], hasMore: true });
    
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            try {
                if (oldChatId) {
                    await conn.invoke("LeaveChat", oldChatId);
                }
                await conn.invoke("JoinChat", chatId);
            } catch (err) {
                console.error("SignalR room switching error:", err);
            }
        }

        await Promise.all([
            get().fetchMessages(chatId),
            get().fetchChatDetails(chatId),
            get().fetchPinnedMessages(chatId)
        ]);
    },

    setLoading: (loading) => set({ isLoading: loading }),

    fetchPinnedMessages: async (chatId: string) => {
        try {
            const pinned = await chatApi.getPinnedMessages(chatId);
            set({ pinnedMessages: pinned });
        } catch (error) {
            console.error("Failed to fetch pinned messages", error);
        }
    },

    updateChatLastMessage: (chatId, lastMessage) => set((state) => {
        const getChatTimestamp = (c: ChatSummaryDto) => 
            c.lastMessage ? new Date(c.lastMessage.createdAt).getTime() : new Date(c.updatedAt).getTime();
    
        const updatedChats = state.chats.map((chat) => 
            chat.id.toLowerCase() === chatId.toLowerCase() 
                ? { ...chat, lastMessage, updatedAt: lastMessage.createdAt } 
                : chat
        );
    
        return {
            chats: updatedChats.sort((a, b) => getChatTimestamp(b) - getChatTimestamp(a))
        };
    }),

    incrementUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id.toLowerCase() === chatId.toLowerCase() && chat.id !== state.activeChatId
                ? { ...chat, unreadCount: chat.unreadCount + 1 }
                : chat
        )
    })),

    fetchChatDetails: async (chatId: string) => {
        try {
            const details = await chatApi.getDetails(chatId);
            set({ activeChatDetails: details, currentChatDetails: details });
        } catch (error) {
            console.error("Failed to fetch chat details", error);
        }
    },

    addMember: async (chatId: string, userId: string) => {
        await chatApi.addMember(chatId, userId);
        get().fetchChatDetails(chatId);
    },

    removeMember: async (chatId: string, userId: string) => {
        await chatApi.removeMember(chatId, userId);
        const currentUserId = useAuthStore.getState().user?.id;
        
        if (currentUserId === userId) {
            set(state => ({ 
                activeChatId: null, 
                activeChatDetails: null,
                currentChatDetails: null,
                chats: state.chats.filter(c => c.id !== chatId)
            }));
        } else {
            get().fetchChatDetails(chatId);
        }
    },

    sendTyping: async (chatId: string) => {
        const conn = get().connection;
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            await conn.invoke("SendTyping", chatId).catch(() => {});
        }
    },

    replyToMessage: null,
    setReplyToMessage: (message) => set({ replyToMessage: message }),

    renameChat: async (chatId: string, newName: string) => {
        try {
            await chatApi.renameChat(chatId, newName);
        } catch (error) {
            console.error("Failed to rename chat", error);
            throw error;
        }
    },

    createDirectChat: async (partnerId) => {
        try {
            const chatDetail = await chatApi.createDirectChat(partnerId);
            const existingChat = get().chats.find(c => c.id === chatDetail.id);
            
            if (!existingChat) {
                const partner = chatDetail.members.find(m => m.userId === partnerId);
                
                const newChatSummary: ChatSummaryDto = {
                    id: chatDetail.id,
                    title: chatDetail.title, 
                    avatarUrl: partner?.avatarUrl || null, 
                    type: chatDetail.type,
                    updatedAt: new Date().toISOString(),
                    lastMessage: null,
                    unreadCount: 0
                };
                set(state => ({ chats: [newChatSummary, ...state.chats] }));
            }
            get().setActiveChat(chatDetail.id);
        } catch (error) {
            console.error("Failed to create direct chat", error);
        }
    },

    createGroupOrChannel: async (chatName, type) => {
        try {
            const chatDetail = await chatApi.createGroupOrChannel(chatName, type);
            const newChatSummary: ChatSummaryDto = {
                id: chatDetail.id,
                title: chatDetail.title,
                avatarUrl: null, 
                type: chatDetail.type,
                updatedAt: new Date().toISOString(),
                lastMessage: null,
                unreadCount: 0
            };
            set(state => ({ chats: [newChatSummary, ...state.chats] }));
            get().setActiveChat(chatDetail.id);
        } catch (error) {
            console.error("Failed to create group/channel", error);
        }
    },

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => m.id === message.id)) return state;
        return { messages: [...state.messages, message] };
    }),

    fetchChats: async () => {
        set({ isLoading: true });
        try {
            const data = await chatApi.getChats();
            set({ chats: data });
        } catch (error) {
            console.error("Failed to fetch chats", error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchMessages: async (chatId, before) => {
        set({ isLoading: true });
        try {
            const data = await messageApi.getHistory(chatId, before);
            const reversed = [...data].reverse();
            set((state) => ({
                messages: before ? [...reversed, ...state.messages] : reversed,
                hasMore: data.length === 20
            }));
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    initSignalR: async () => {
        // 1. Если соединение уже инициализировано (не важно, стартует оно или уже подключено) — жестко выходим
        if (get().connection) {
            return;
        }
    
        const token = localStorage.getItem('token');
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();
    
        // 2. СИНХРОННО пишем ссылку на сокет в стейт ДО вызова await!
        // Теперь любой повторный вызов initSignalR споткнется о верхнюю проверку
        set({ connection });
    
        // Навешиваем обработчики событий
        connection.on("ReceiveMessage", (message: MessageDto) => {
            const msgChatId = message.chatId.toLowerCase();
            const isActiveChat = msgChatId === get().activeChatId?.toLowerCase();
    
            useMessageStore.getState().addMessage(message.chatId, message);
        
            if (isActiveChat) {
                get().addMessage(message);
            }
        
            set((state) => {
                const getChatTimestamp = (c: ChatSummaryDto) => 
                    c.lastMessage ? new Date(c.lastMessage.createdAt).getTime() : new Date(c.updatedAt).getTime();
        
                const updatedChats = state.chats.map((chat) => {
                    if (chat.id.toLowerCase() !== msgChatId) {
                        return chat;
                    }
        
                    const newUnreadCount = isActiveChat ? chat.unreadCount : chat.unreadCount + 1;
        
                    return { 
                        ...chat, 
                        lastMessage: message, 
                        updatedAt: message.createdAt,
                        unreadCount: newUnreadCount
                    };
                });
        
                return {
                    chats: updatedChats.sort((a, b) => getChatTimestamp(b) - getChatTimestamp(a))
                };
            });
        });
    
        connection.on("MessageDeleted", (chatId: string, mId: string, nextLastMessage: MessageDto | null) => {
            const cIdLower = chatId.toLowerCase();
            const isActiveChat = cIdLower === get().activeChatId?.toLowerCase();
        
            useMessageStore.getState().deleteMessage(chatId, mId);
        
            set(state => {
                const updatedMessages = state.messages.filter(m => m.id !== mId);
                const updatedPinned = state.pinnedMessages.filter(m => m.id !== mId);
        
                const updatedChats = state.chats.map(chat => {
                    if (chat.id.toLowerCase() !== cIdLower) return chat;
        
                    const newUnreadCount = isActiveChat 
                        ? 0 
                        : Math.max(0, chat.unreadCount - 1);
        
                    if (chat.lastMessage?.id !== mId) {
                        return {
                            ...chat,
                            unreadCount: newUnreadCount
                        };
                    }
        
                    const newLastMessage = nextLastMessage;
                    const newUpdatedAt = newLastMessage ? newLastMessage.createdAt : chat.updatedAt;
        
                    return {
                        ...chat,
                        lastMessage: newLastMessage,
                        updatedAt: newUpdatedAt,
                        unreadCount: newUnreadCount
                    };
                });
        
                const getChatTimestamp = (c: ChatSummaryDto) => 
                    c.lastMessage ? new Date(c.lastMessage.createdAt).getTime() : new Date(c.updatedAt).getTime();
        
                const sortedChats = [...updatedChats].sort((a, b) => getChatTimestamp(b) - getChatTimestamp(a));
        
                return {
                    messages: updatedMessages,
                    pinnedMessages: updatedPinned,
                    chats: sortedChats
                };
            });
        });
        
        connection.on("MessageUpdated", (updatedMsg: MessageDto) => {
            const activeId = get().activeChatId?.toLowerCase();
            const msgChatId = updatedMsg.chatId.toLowerCase();
        
            useMessageStore.getState().updateMessage(updatedMsg.chatId, updatedMsg);
        
            if (msgChatId === activeId) {
                set(state => {
                    const newMessages = state.messages.map(m => m.id === updatedMsg.id ? updatedMsg : m);
                    let newPinned = [...state.pinnedMessages];
                    if (updatedMsg.isPinned) {
                        const exists = newPinned.find(p => p.id === updatedMsg.id);
                        if (exists) {
                            newPinned = newPinned.map(p => p.id === updatedMsg.id ? updatedMsg : p);
                        } else {
                            newPinned = [...newPinned, updatedMsg].sort((a, b) => 
                                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                            );
                        }
                    } else {
                        newPinned = newPinned.filter(p => p.id !== updatedMsg.id);
                    }
        
                    return { 
                        messages: newMessages, 
                        pinnedMessages: newPinned 
                    };
                });
            }
            
            set(state => ({
                chats: state.chats.map(c => 
                    c.id.toLowerCase() === msgChatId ? { ...c, lastMessage: updatedMsg } : c
                )
            }));
        });
        
        connection.on("ChatUpdated", (id: string, newName: string) => {
            set(state => ({
                chats: state.chats.map(c => c.id === id ? { ...c, title: newName } : c),
                activeChatDetails: state.activeChatDetails?.id === id 
                    ? { ...state.activeChatDetails, title: newName } : state.activeChatDetails,
                currentChatDetails: state.currentChatDetails?.id === id 
                    ? { ...state.currentChatDetails, title: newName } : state.currentChatDetails
            }));
        });
        
        connection.on("ChatCreated", (newChat: ChatSummaryDto) => {
            set(state => {
                if (state.chats.some(c => c.id === newChat.id)) return state;
                return { chats: [newChat, ...state.chats] };
            });
        });
        
        connection.on("ChatRemoved", (chatId: string) => {
            const isCurrent = get().activeChatId?.toLowerCase() === chatId.toLowerCase();
            set(state => ({
                chats: state.chats.filter(c => c.id.toLowerCase() !== chatId.toLowerCase()),
                activeChatId: isCurrent ? null : state.activeChatId,
                activeChatDetails: isCurrent ? null : state.activeChatDetails,
                currentChatDetails: isCurrent ? null : state.currentChatDetails,
                messages: isCurrent ? [] : state.messages,
                pinnedMessages: isCurrent ? [] : state.pinnedMessages
            }));
        });
        
        connection.on("MessagesRead", (chatId: string, readerId: string) => {
            if (readerId === useAuthStore.getState().user?.id) {
                get().resetUnreadCount(chatId);
            }
        });
    
        // 3. Запускаем само подключение к серверу
        try {
            await connection.start();
    
            const currentActive = get().activeChatId;
            if (currentActive) {
                await connection.invoke("JoinChat", currentActive);
            }
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            // Если при старте произошел сбой — сбрасываем коннект в null, чтобы дать шанс следующей попытке
            set({ connection: null });
        }
    },
    
    disconnectFromChat: async (chatId) => {
        const conn = get().connection;
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            try {
                await conn.invoke("LeaveChat", chatId);
            } catch (err) {
                console.error("Error leaving chat room:", err);
            }
        }

        set({ messages: [], pinnedMessages: [], activeChatId: null });
    },

    resetUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id.toLowerCase() === chatId.toLowerCase() 
                ? { ...chat, unreadCount: 0 } 
                : chat
        )
    }))
}));