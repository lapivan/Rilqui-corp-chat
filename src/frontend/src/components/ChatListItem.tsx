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
            // Уменьшили внутренний отступ с p-3 до p-2, скругление углов с rounded-xl до rounded-lg, убрали mb-1 (или заменили на mb-0.5 по вкусу)
            className={`flex items-center p-2 cursor-pointer transition-all duration-200 select-none mx-2 rounded-lg mb-0.5
                ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-slate-800/50'}`}
        >
            <div className="relative flex-shrink-0">
                <Avatar 
                    url={chat.avatarUrl} 
                    name={chat.title || 'Chat'} 
                    // Уменьшили размер аватарки с w-12 h-12 до w-9 h-9
                    className="w-9 h-9 text-xs" 
                />
                {chat.unreadCount > 0 && !isActive && (
                    // Сжали бейдж непрочитанных сообщений (px-1.5 py-0.5 -> px-1, уменьшили текст до text-[9px])
                    <div className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full border border-slate-900">
                        {chat.unreadCount}
                    </div>
                )}
            </div>

            {/* Уменьшили левый отступ контента от аватарки с ml-3 до ml-2 */}
            <div className="ml-2 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                    {/* Снизили плотность шрифта (с font-semibold до font-medium), чтобы текст читался лучше в уменьшенном виде */}
                    <h3 className={`font-medium truncate text-sm ${isActive ? 'text-white' : 'text-slate-100'}`}>
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