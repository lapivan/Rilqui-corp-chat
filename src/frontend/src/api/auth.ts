import api from './api';
import type { 
    UserDto, 
    LoginRequest, 
    RegisterRequest, 
    AuthResponse, 
    UpdateProfileRequest,
    AvatarResponse 
} from '../types';

export const authApi = {
    login: (values: LoginRequest): Promise<AuthResponse> => 
        api.post<AuthResponse>('/user/login', values).then(res => res.data),
    
    register: (values: RegisterRequest): Promise<UserDto> => 
        api.post<UserDto>('/user/register', values).then(res => res.data),
    
    getCurrentUser: (): Promise<UserDto> => 
        api.get<UserDto>('/user/me').then(res => res.data),
    
    updateProfile: (values: UpdateProfileRequest): Promise<UserDto> => 
        api.put<UserDto>('/user/profile', values).then(res => res.data),
    
    uploadAvatar: (file: File): Promise<AvatarResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<AvatarResponse>('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => res.data);
    },

    searchUsers: (term: string): Promise<UserDto[]> => 
        api.get<UserDto[]>('/user/search', { params: { term } }).then(res => res.data)
};