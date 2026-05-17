import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { messageApi } from '../api/messageApi';
import type { MessageDto } from '../types';

interface ChatSearchProps {
    chatId: string;
    onClose: () => void;
    onMessageJump: (messageId: string) => void; // <-- Добавили новый проп
}

export const ChatSearch = ({ chatId, onClose, onMessageJump }: ChatSearchProps) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MessageDto[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const data = await messageApi.searchMessages(chatId, debouncedQuery);
                setResults(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        };
        performSearch();
    }, [debouncedQuery, chatId]);

    return (
        <div className="absolute inset-x-0 top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-2 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-1">
                <Search size={18} className="text-slate-400" />
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-200"
                />
                {isSearching && <Loader2 size={16} className="animate-spin text-blue-500" />}
                <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
                    <X size={18} className="text-slate-400" />
                </button>
            </div>

            {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-b-xl shadow-2xl max-h-64 overflow-y-auto custom-scrollbar">
                    {results.map((msg) => (
                        <div 
                            key={msg.id}
                            className="p-3 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800/50 last:border-none"
                            onClick={() => {
                                onMessageJump(msg.id); // <-- Прыгаем к сообщению
                                onClose();             // <-- Закрываем поиск
                            }}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-blue-400">{msg.senderName}</span>
                                <span className="text-[10px] text-slate-500">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-2">{msg.content || (msg.fileName ? `📎 ${msg.fileName}` : '')}</p>
                        </div>
                    ))}
                </div>
            )}
            {debouncedQuery.length >= 2 && !isSearching && results.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 p-4 text-center text-sm text-slate-500 rounded-b-xl">
                    No messages found
                </div>
            )}
        </div>
    );
};