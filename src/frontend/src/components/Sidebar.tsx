import { Search, Menu, Settings, Users } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { ChatListItem } from '../components/ChatListItem';

export const Sidebar = () => {
    const { chats, activeChatId, setActiveChat } = useChatStore();

    return (
        <aside className="w-80 lg:w-[380px] h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Menu size={20} className="text-white cursor-pointer" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Chats</h2>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 text-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all focus:ring-4 focus:ring-blue-500/5"
                    />
                </div>
            </div>

            <div className="flex px-4 gap-6 border-b border-slate-800/50 overflow-x-auto no-scrollbar">
                {['All', 'Personal', 'Groups'].map((tab, i) => (
                    <button 
                        key={tab} 
                        className={`pb-3 text-sm font-semibold transition-all relative ${i === 0 ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab}
                        {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
                {chats.length > 0 ? (
                    chats.map(chat => (
                        <ChatListItem 
                            key={chat.id}
                            chat={chat}
                            isActive={activeChatId === chat.id}
                            onClick={() => setActiveChat(chat.id)}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 px-8 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                            <Users size={32} className="opacity-20" />
                        </div>
                        <p className="text-sm">No conversations yet.</p>
                    </div>
                )}
            </div>
        </aside>
    );
};