import { useState } from 'react';
import { X, Users, Hash } from 'lucide-react';

import { useChatStore } from '../store/chatStore';
import { ChatType } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateChatModal = ({
    isOpen,
    onClose
}: Props) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChatType>(
        ChatType.Group
    );

    const [isLoading, setIsLoading] =
        useState(false);

    const { createGroupOrChannel } =
        useChatStore();

    if (!isOpen) return null;

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!name.trim()) return;

        setIsLoading(true);

        await createGroupOrChannel(
            name.trim(),
            type
        );

        setIsLoading(false);

        setName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.65)] animate-in zoom-in-95 duration-200">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-semibold tracking-wide text-white">
                            Create Chat
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            New workspace conversation
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* BODY */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 p-6"
                >
                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Chat Name
                        </label>

                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={e =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter workspace name..."
                            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() =>
                                setType(
                                    ChatType.Group
                                )
                            }
                            className={`group flex flex-col items-center gap-3 rounded-2xl border px-4 py-5 transition-all
                            ${
                                type ===
                                ChatType.Group
                                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10'
                                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                        >
                            <div
                                className={`rounded-2xl p-3 transition-all ${
                                    type ===
                                    ChatType.Group
                                        ? 'bg-blue-500/15'
                                        : 'bg-slate-800'
                                }`}
                            >
                                <Users size={22} />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-semibold">
                                    Group
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Team communication
                                </p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setType(
                                    ChatType.Channel
                                )
                            }
                            className={`group flex flex-col items-center gap-3 rounded-2xl border px-4 py-5 transition-all
                            ${
                                type ===
                                ChatType.Channel
                                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/10'
                                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                        >
                            <div
                                className={`rounded-2xl p-3 transition-all ${
                                    type ===
                                    ChatType.Channel
                                        ? 'bg-blue-500/15'
                                        : 'bg-slate-800'
                                }`}
                            >
                                <Hash size={22} />
                            </div>

                            <div className="text-center">
                                <p className="text-sm font-semibold">
                                    Channel
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Broadcast updates
                                </p>
                            </div>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            !name.trim() || isLoading
                        }
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:from-blue-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                    >
                        {isLoading
                            ? 'Creating...'
                            : 'Create Chat'}
                    </button>
                </form>
            </div>
        </div>
    );
};