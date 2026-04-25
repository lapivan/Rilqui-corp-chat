import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '../types';
import { signalRService } from '../features/services/signalRService';
import { useChatStore } from './chatStore';
import { useMessageStore } from './messageStore';

interface AuthState {
    user: UserDto | null;
    token: string | null;
    setAuth: (user: UserDto, token: string) => void;
    logout: () => void;
    updateUser: (data: Partial<UserDto>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,

            setAuth: (user, token) => {
                set({ user, token });
                localStorage.setItem('token', token);
                if (signalRService?.init) {
                    signalRService.init(token);
                }
            },

            logout: () => {
                const chatStore = useChatStore.getState();
                if (chatStore.connection) {
                    chatStore.connection.stop().catch(console.error);
                }
                useMessageStore.setState({ messagesByChat: {} });

                useChatStore.setState({ 
                    chats: [], 
                    messages: [],
                    activeChatId: null,
                    connection: null 
                });

                set({ user: null, token: null });
                localStorage.removeItem('token');

                window.location.href = '/login';
            },

            updateUser: (data) => set((state) => ({
                user: state.user ? { ...state.user, ...data } : null
            })),
        }),
        {
            name: 'rilqui-auth-storage',
        }
    )
);