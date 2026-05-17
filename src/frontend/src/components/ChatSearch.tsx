import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

import { useDebounce } from '../hooks/useDebounce';
import { messageApi } from '../api/messageApi';

import type { MessageDto } from '../types';

interface ChatSearchProps {
    chatId: string;
    onClose: () => void;
    onMessageJump: (messageId: string) => void;
}

export const ChatSearch = ({
    chatId,
    onClose,
    onMessageJump
}: ChatSearchProps) => {
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
                const data =
                    await messageApi.searchMessages(
                        chatId,
                        debouncedQuery
                    );

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
        <div className="absolute inset-x-0 top-0 z-40 border-b border-slate-800/70 bg-slate-950/90 px-5 py-4 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-xl">
                <Search
                    size={17}
                    className="text-slate-500"
                />

                <input
                    autoFocus
                    value={query}
                    onChange={e =>
                        setQuery(e.target.value)
                    }
                    placeholder="Search messages..."
                    className="flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />

                {isSearching && (
                    <Loader2
                        size={15}
                        className="animate-spin text-blue-400"
                    />
                )}

                <button
                    onClick={onClose}
                    className="rounded-xl p-1.5 text-slate-500 transition-all hover:bg-slate-800 hover:text-white"
                >
                    <X size={17} />
                </button>
            </div>

            {results.length > 0 && (
                <div className="custom-scrollbar absolute left-5 right-5 top-full mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                    {results.map(msg => (
                        <div
                            key={msg.id}
                            className="cursor-pointer border-b border-slate-800/60 px-4 py-3 transition-all hover:bg-slate-900/90 last:border-0"
                            onClick={() => {
                                onMessageJump(msg.id);
                                onClose();
                            }}
                        >
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold tracking-wide text-blue-400">
                                    {msg.senderName}
                                </span>

                                <span className="text-[11px] text-slate-500">
                                    {new Date(
                                        msg.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>

                            <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
                                {msg.content ||
                                    (msg.fileName
                                        ? `📎 ${msg.fileName}`
                                        : '')}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {debouncedQuery.length >= 2 &&
                !isSearching &&
                results.length === 0 && (
                    <div className="absolute left-5 right-5 top-full mt-2 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-5 text-center text-sm text-slate-500 shadow-2xl">
                        No messages found
                    </div>
                )}
        </div>
    );
};