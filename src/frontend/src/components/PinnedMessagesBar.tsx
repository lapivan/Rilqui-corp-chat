interface PinnedProps {
    messages: MessageDto[];
    onUnpin: (id: string) => void;
    onJump: (id: string) => void;
}

import { ChevronLeft, ChevronRight, Pin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MessageDto } from '../types';

export const PinnedMessagesBar = ({ messages, onUnpin, onJump }: PinnedProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (messages.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentIndex(messages.length - 1);
        }
    }, [messages.length]);

    if (messages.length === 0) return null;

    const activeIndex = Math.min(currentIndex, messages.length - 1);
    const currentPin = messages[activeIndex];

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2 flex items-center justify-between z-20">
            <div 
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => onJump(currentPin.id)}
            >
                <Pin size={14} className="text-blue-400 rotate-45 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
                            Pinned message {messages.length > 1 ? `(${activeIndex + 1} из ${messages.length})` : ''}
                        </p>
                    </div>
                    <p className="text-xs text-slate-300 truncate">
                        {currentPin.content || (currentPin.fileName ? 'File' : 'Message')}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                {messages.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={handleNext} className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </>
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); onUnpin(currentPin.id); }}
                    className="p-1 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};