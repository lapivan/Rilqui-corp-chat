import api from './api';
import type { MessageDto, SendFileRequest } from '../types';

export const messageApi = {
    getHistory: async (chatId: string, before?: string, take: number = 20) => {
        const response = await api.get<MessageDto[]>(`/messages/${chatId}`, {
            params: { before, take }
        });
        return response.data;
    },

    sendText: async (chatId: string, content: string, parentMessageId?: string) => {
        const response = await api.post<MessageDto>('/messages', {
            chatId,
            content,
            parentMessageId
        });
        return response.data;
    },

    sendFile: async (request: SendFileRequest) => {
        const formData = new FormData();
        formData.append('ChatId', request.chatId);
        formData.append('File', request.file);
        if (request.description) formData.append('Description', request.description);
        if (request.parentMessageId) formData.append('ParentMessageId', request.parentMessageId);

        const response = await api.post<MessageDto>('/messages/file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    editMessage: async (id: string, newContent: string) => {
        const response = await api.put<MessageDto>(`/messages/${id}`, 
            JSON.stringify(newContent), 
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    },

    pinMessage: async (id: string) => {
        await api.patch(`/messages/${id}/pin`);
    },
    unpinMessage: async (id: string) => {
        await api.patch(`/messages/${id}/unpin`);
    },

    deleteMessage: async (id: string) => {
        await api.delete(`/messages/${id}`);
    },

    searchMessages: async (chatId: string, query: string) => {
        const response = await api.get<MessageDto[]>(`/messages/${chatId}/search?query=${encodeURIComponent(query)}`);
        return response.data;
    }
};