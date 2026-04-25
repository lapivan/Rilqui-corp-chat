import { Sidebar } from '../../../components/Sidebar';
import { ChatWindow } from '../../../components/ChatWindow';

export const ChatPage = () => {
    return (
        <div className="flex h-screen w-full bg-[#0b1120] overflow-hidden text-slate-200">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 relative">
                <ChatWindow />
            </main>
        </div>
    );
};