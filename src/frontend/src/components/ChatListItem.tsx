import type { ChatSummaryDto } from '../types';
import { Avatar } from './Avatar';


interface ChatListItemProps {
    chat: ChatSummaryDto;
    isActive: boolean;
    onClick: () => void;
}

export const ChatListItem = ({ chat, isActive, onClick }: ChatListItemProps) => {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center p-3 cursor-pointer transition-all duration-200 select-none mx-2 rounded-xl mb-1
                ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}
        >
            <div className="relative flex-shrink-0">
                <Avatar 
                    url={chat.avatarUrl} 
                    name={chat.title || 'Chat'} 
                    className="w-12 h-12" 
                />
                {chat.unreadCount > 0 && !isActive && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-900">
                        {chat.unreadCount}
                    </div>
                )}
            </div>

            <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                    <h3 className={`font-semibold truncate text-sm ${isActive ? 'text-white' : 'text-slate-100'}`}>
                        {chat.title || 'Saved Messages'}
                    </h3>
                </div>
                <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {chat.lastMessage?.content || 'No messages yet'}
                </p>
            </div>
        </div>
    );
};