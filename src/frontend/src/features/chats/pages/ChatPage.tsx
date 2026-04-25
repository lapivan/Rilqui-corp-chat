import { Sidebar } from '../../../components/Sidebar';
import { MessageSquare } from 'lucide-react';

export const ChatPage = () => {
    return (
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col relative bg-[url('https://i.pinimg.com/originals/1d/1a/0d/1d1a0d8f07010a30b50160b73b508f7f.jpg')] bg-repeat bg-center">
                <div className="absolute inset-0 bg-slate-950/90 pointer-events-none" />

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-slate-500">
                    <div className="bg-slate-900/50 p-4 rounded-full mb-4 border border-slate-800">
                        <MessageSquare size={48} className="opacity-20" />
                    </div>
                    <p className="text-sm font-medium bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800/50 backdrop-blur-sm">
                        Select a chat to start messaging
                    </p>
                </div>
            </main>
        </div>
    );
};