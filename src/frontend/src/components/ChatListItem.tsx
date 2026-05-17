import type { ChatSummaryDto } from '../types';
import { Avatar } from './Avatar';

interface ChatListItemProps {
    chat: ChatSummaryDto;
    isActive: boolean;
    onClick: () => void;
}

export const ChatListItem = ({
    chat,
    isActive,
    onClick
}: ChatListItemProps) => {
    return (
        <div
            onClick={onClick}
            className={`group mx-2 mb-1 flex cursor-pointer items-center rounded-2xl border px-3 py-3 transition-all duration-200
            ${
                isActive
                    ? 'border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-blue-500/10 shadow-lg shadow-blue-900/20'
                    : 'border-transparent hover:border-slate-700/50 hover:bg-slate-800/40'
            }`}
        >
            <div className="relative flex-shrink-0">
                <Avatar
                    url={chat.avatarUrl}
                    name={chat.title || 'Chat'}
                    className="h-11 w-11 border border-slate-700/50 text-sm"
                />

                {chat.unreadCount > 0 && !isActive && (
                    <div className="absolute -right-1 -top-1 min-w-[18px] rounded-full border border-slate-950 bg-blue-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white shadow-lg">
                        {chat.unreadCount}
                    </div>
                )}
            </div>

            <div className="ml-3 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <h3
                        className={`truncate text-sm font-semibold tracking-[0.01em]
                        ${
                            isActive
                                ? 'text-white'
                                : 'text-slate-100 group-hover:text-white'
                        }`}
                    >
                        {chat.title || 'Saved Messages'}
                    </h3>
                </div>

                <p
                    className={`mt-1 truncate text-xs leading-relaxed
                    ${
                        isActive
                            ? 'text-blue-100/80'
                            : 'text-slate-400'
                    }`}
                >
                    {chat.lastMessage?.content || 'No messages yet'}
                </p>
            </div>
        </div>
    );
};