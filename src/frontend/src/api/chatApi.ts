import api from './api';
import type { ChatSummaryDto, ChatDetailDto, ChatType, MessageDto } from '../types';

export const chatApi = {
    getChats: async () => {
        const response = await api.get<ChatSummaryDto[]>('/chats');
        return response.data;
    },

    createDirectChat: async (partnerId: string) => {
        const response = await api.post<ChatDetailDto>('/chats/direct', { partnerId });
        return response.data;
    },

    addMember: async (chatId: string, userId: string) => {
        await api.post(`/chats/${chatId}/members`, JSON.stringify(userId), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    getPinnedMessages: async (chatId: string) => {
        const response = await api.get<MessageDto[]>(`/chats/${chatId}/pinned`);
        return response.data;
    },

    removeMember: async (chatId: string, userId: string) => {
        await api.delete(`/chats/${chatId}/members/${userId}`);
    },

    renameChat: async (chatId: string, newName: string) => {
        await api.patch(`/chats/${chatId}/rename`, JSON.stringify(newName), {
            headers: { 'Content-Type': 'application/json' }
        });
    },
    getDetails: async (id: string) => {
        const response = await api.get<ChatDetailDto>(`/chats/${id}`);
        return response.data;
    },

    markAsRead: async (chatId: string) => {
        await api.post(`/chats/${chatId}/read`);
    }, 
    getMyChats: async () => {
        const response = await api.get<ChatSummaryDto[]>('/chats');
        return response.data;
    },

    createGroupOrChannel: async (chatName: string, type: ChatType) => {
        const response = await api.post<ChatDetailDto>('/chats/group', { chatName, type });
        return response.data;
    }
};