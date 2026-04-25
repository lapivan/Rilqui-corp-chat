import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { ChatType, UserRole } from '../types';

export const useChatPermissions = () => {
    const user = useAuthStore(state => state.user);
    const details = useChatStore(state => state.currentChatDetails);

    if (!details || !user) {
        return { 
            isAdmin: false, 
            isChannel: false, 
            canWrite: true,
            member: null 
        };
    }

    const member = details.members.find(m => m.userId === user.id);
    const isAdmin = member?.role === UserRole.Admin;
    const isChannel = details.type === ChatType.Channel;
    
    const canWrite = !isChannel || isAdmin;

    return { isAdmin, isChannel, canWrite, member };
};