import type { UserDto } from '../types';
import { User } from 'lucide-react';

interface SearchResultItemProps {
    user: UserDto;
    onClick: () => void;
    isCreating: boolean;
}

export const SearchResultItem = ({ user, onClick, isCreating }: SearchResultItemProps) => {
    return (
        <div 
            onClick={!isCreating ? onClick : undefined}
            className={`flex items-center gap-3 p-3 mx-2 rounded-xl cursor-pointer transition-all ${isCreating ? 'opacity-50' : 'hover:bg-slate-800/50'}`}
        >
            <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
                        <User size={24} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-white truncate">{user.fullname}</h4>
                </div>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
        </div>
    );
};