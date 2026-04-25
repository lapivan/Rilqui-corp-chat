import { create } from 'zustand';
import type { MessageDto } from '../types';
import { messageApi } from '../api/messageApi';
import { useAuthStore } from './authStore';

interface ChatMessages {
    items: MessageDto[];
    hasMore: boolean;
    oldestTimestamp: string | null;
}

interface MessageState {
    messagesByChat: Record<string, ChatMessages>;
    setMessages: (chatId: string, messages: MessageDto[], hasMore: boolean) => void;
    prependMessages: (chatId: string, messages: MessageDto[], hasMore: boolean) => void;
    addMessage: (chatId: string, message: MessageDto) => void;
    updateMessage: (chatId: string, message: MessageDto) => void;
    deleteMessage: (chatId: string, messageId: string) => void;
    sendOptimisticText: (chatId: string, content: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    messagesByChat: {},

    setMessages: (chatId, items, hasMore) => set((state) => ({
        messagesByChat: {
            ...state.messagesByChat,
            [chatId]: {
                items,
                hasMore,
                oldestTimestamp: items.length > 0 ? items[0].createdAt : null
            }
        }
    })),

    addMessage: (chatId, message) => set((state) => {
        const chatData = state.messagesByChat[chatId] || { items: [], hasMore: false, oldestTimestamp: null };
        if (chatData.items.some(m => m.id === message.id)) return state;
        
        return {
            messagesByChat: {
                ...state.messagesByChat,
                [chatId]: {
                    ...chatData,
                    items: [...chatData.items, message]
                }
            }
        };
    }),

    prependMessages: (chatId, newItems, hasMore) => set((state) => {
        const currentData = state.messagesByChat[chatId];
        return {
            messagesByChat: {
                ...state.messagesByChat,
                [chatId]: {
                    items: [...newItems, ...currentData.items],
                    hasMore,
                    oldestTimestamp: newItems.length > 0 ? newItems[0].createdAt : currentData.oldestTimestamp
                }
            }
        };
    }),

    updateMessage: (chatId, updatedMsg) => set((state) => {
        const chatData = state.messagesByChat[chatId];
        if (!chatData) return state;
        return {
            messagesByChat: {
                ...state.messagesByChat,
                [chatId]: {
                    ...chatData,
                    items: chatData.items.map(m => (m.id === updatedMsg.id || (updatedMsg.tempId && m.tempId === updatedMsg.tempId)) ? updatedMsg : m)
                }
            }
        };
    }),

    deleteMessage: (chatId, messageId) => set((state) => {
        const chatData = state.messagesByChat[chatId];
        if (!chatData) return state;
        return {
            messagesByChat: {
                ...state.messagesByChat,
                [chatId]: {
                    ...chatData,
                    items: chatData.items.filter(m => m.id !== messageId)
                }
            }
        };
    }),

    sendOptimisticText: async (chatId, content) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const tempId = crypto.randomUUID();
        const optimisticMsg: MessageDto = {
            id: tempId,
            tempId: tempId,
            chatId,
            senderId: user.id,
            senderName: user.fullname || user.username,
            content,
            type: 0,
            createdAt: new Date().toISOString(),
            isPinned: false,
            parentMessageId: null,
            fileUrl: null,
            fileName: null,
            fileSize: null,
            isSending: true
        };

        get().addMessage(chatId, optimisticMsg);

        try {
            const realMsg = await messageApi.sendText(chatId, content);
            get().updateMessage(chatId, { ...realMsg, tempId });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            get().updateMessage(chatId, { ...optimisticMsg, isSending: false, isError: true });
        }
    }
}));