import { Pin, X } from 'lucide-react';
import type { MessageDto } from '../types';

interface Props {
    messages: MessageDto[];
    onUnpin: (id: string) => void;
    onJump: (id: string) => void;
}

export const PinnedMessagesBar = ({ messages, onUnpin, onJump }: Props) => {
    if (messages.length === 0) return null;

    const latestPin = messages[messages.length - 1];

    return (
        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between z-20">
            <div 
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => onJump(latestPin.id)}
            >
                <Pin size={14} className="text-blue-400 rotate-45" />
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Pinned Message</p>
                    <p className="text-xs text-slate-300 truncate">
                        {latestPin.content || (latestPin.fileName ? 'File' : 'Message')}
                    </p>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onUnpin(latestPin.id); }}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};