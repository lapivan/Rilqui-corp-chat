import api from './api';
import type { UserDto, UpdateProfileRequest, AvatarResponse } from '../types';

export const userApi = {
    getMe: async () => {
        const response = await api.get<UserDto>('/user/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest) => {
        const response = await api.put<UserDto>('/user/profile', data);
        return response.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post<AvatarResponse>('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    searchUsers: async (term: string) => {
        if (!term.trim()) return [];
        const response = await api.get<UserDto[]>(`/user/search?term=${encodeURIComponent(term)}`);
        return response.data;
    }
};