import { create } from 'zustand';
import type { ChatDetailDto, ChatSummaryDto, MessageDto } from '../types';
import * as signalR from '@microsoft/signalr';
import { messageApi } from '../api/messageApi';
import { ChatType } from '../types';
import { chatApi } from '../api/chatApi';
import { useAuthStore } from './authStore';

interface ChatState {
    chats: ChatSummaryDto[];
    messages: MessageDto[];
    pinnedMessages: MessageDto[]; // Список закрепленных сообщений
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
    initSignalR: (chatId: string) => Promise<void>;
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
    
    setActiveChat: (chatId) => {
        const prevId = get().activeChatId;
        const conn = get().connection;

        if (conn && prevId && prevId !== chatId && conn.state === signalR.HubConnectionState.Connected) {
            conn.invoke("LeaveChat", prevId).catch(console.error);
        }

        set({ activeChatId: chatId, messages: [], pinnedMessages: [], hasMore: true });

        if (chatId) {
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.invoke("JoinChat", chatId).catch(console.error);
            }
            get().fetchMessages(chatId);
            get().fetchPinnedMessages(chatId); // Загружаем закрепы при входе в чат
            get().fetchChatDetails(chatId);
            get().resetUnreadCount(chatId);
        }
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

    updateChatLastMessage: (chatId, lastMessage) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id.toLowerCase() === chatId.toLowerCase() 
                ? { ...chat, lastMessage, updatedAt: new Date().toISOString() } 
                : chat
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    })),

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
                const newChatSummary: ChatSummaryDto = {
                    id: chatDetail.id,
                    title: chatDetail.title, 
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

    initSignalR: async (chatId) => {
        const oldConn = get().connection;
        if (oldConn) {
            await oldConn.stop();
        }

        const token = localStorage.getItem('token');
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveMessage", (message: MessageDto) => {
            get().updateChatLastMessage(message.chatId, message);
            if (message.chatId.toLowerCase() === get().activeChatId?.toLowerCase()) {
                get().addMessage(message);
            } else {
                get().incrementUnreadCount(message.chatId);
            }
        });

        connection.on("MessageDeleted", (_cId, mId) => {
            set(state => ({ 
                messages: state.messages.filter(m => m.id !== mId),
                pinnedMessages: state.pinnedMessages.filter(m => m.id !== mId)
            }));
        });

        connection.on("MessageUpdated", (updatedMsg: MessageDto) => {
            const activeId = get().activeChatId?.toLowerCase();
            const msgChatId = updatedMsg.chatId.toLowerCase();

            if (msgChatId === activeId) {
                set(state => {
                    // Обновляем в основном списке сообщений
                    const newMessages = state.messages.map(m => m.id === updatedMsg.id ? updatedMsg : m);
                    
                    // Обновляем список закрепов
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
            
            // Обновляем превью в списке чатов
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

        try {
            await connection.start();
            if (chatId) {
                await connection.invoke("JoinChat", chatId);
            }
            set({ connection });
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
        }
    },

    disconnectFromChat: async (chatId) => {
        const conn = get().connection;
        if (conn) {
            try {
                if (conn.state === signalR.HubConnectionState.Connected) {
                    await conn.invoke("LeaveChat", chatId);
                }
                await conn.stop();
            } catch (err) {
                console.error(err);
            }
            set({ connection: null, messages: [], pinnedMessages: [], activeChatId: null });
        }
    },

    resetUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id.toLowerCase() === chatId.toLowerCase() 
                ? { ...chat, unreadCount: 0 } 
                : chat
        )
    }))
}));