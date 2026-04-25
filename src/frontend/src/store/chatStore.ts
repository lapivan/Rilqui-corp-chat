import { create } from 'zustand';
import type { ChatSummaryDto, MessageDto } from '../types';

interface ChatState {
    chats: ChatSummaryDto[];
    activeChatId: string | null;
    isLoading: boolean;
    setChats: (chats: ChatSummaryDto[]) => void;
    setActiveChat: (chatId: string | null) => void;
    updateChatLastMessage: (chatId: string, lastMessage: MessageDto) => void;
    incrementUnreadCount: (chatId: string) => void;
    resetUnreadCount: (chatId: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    activeChatId: null,
    isLoading: false,

    setChats: (chats) => set({ chats }),

    setActiveChat: (chatId) => set({ activeChatId: chatId }),

    setLoading: (loading) => set({ isLoading: loading }),

    updateChatLastMessage: (chatId, lastMessage) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id === chatId 
                ? { ...chat, lastMessage, updatedAt: new Date().toISOString() } 
                : chat
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    })),

    incrementUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id === chatId && chat.id !== state.activeChatId
                ? { ...chat, unreadCount: chat.unreadCount + 1 }
                : chat
        )
    })),

    resetUnreadCount: (chatId) => set((state) => ({
        chats: state.chats.map((chat) => 
            chat.id === chatId 
                ? { ...chat, unreadCount: 0 } 
                : chat
        )
    }))
}));