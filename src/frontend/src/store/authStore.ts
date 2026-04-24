import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '../types';
import { signalRService } from '../features/services/signalRService';

interface AuthState {
    user: UserDto | null;
    token: string | null;
    setAuth: (user: UserDto, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => {
                set({ user, token });
                localStorage.setItem('token', token);
                signalRService.init(token);
            },
            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('token');
                signalRService.stop();
                window.location.href = '/login';
            },
        }),
        {
            name: 'rilqui-auth-storage',
        }
    )
);