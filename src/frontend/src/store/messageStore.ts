import { create } from 'zustand';
import type { MessageDto } from '../types';

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
}

export const useMessageStore = create<MessageState>((set) => ({
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
                    items: chatData.items.map(m => m.id === updatedMsg.id ? updatedMsg : m)
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
    })
}));