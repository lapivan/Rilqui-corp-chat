import { useState } from 'react';
import { X, Users, Hash } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatType } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateChatModal = ({ isOpen, onClose }: Props) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<ChatType>(ChatType.Group);
    const [isLoading, setIsLoading] = useState(false);
    const { createGroupOrChannel } = useChatStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        await createGroupOrChannel(name.trim(), type);
        setIsLoading(false);
        setName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">New Chat</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Chat Name</label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter chat name..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType(ChatType.Group)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                type === ChatType.Group 
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                                : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <Users size={24} />
                            <span className="text-sm font-medium">Group</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setType(ChatType.Channel)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                type === ChatType.Channel 
                                ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                                : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <Hash size={24} />
                            <span className="text-sm font-medium">Channel</span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2.5 rounded-xl transition-colors"
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
        </div>
    );
};