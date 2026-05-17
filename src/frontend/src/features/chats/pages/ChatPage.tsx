import { Sidebar } from '../../../components/Sidebar';
import { ChatWindow } from '../../../components/ChatWindow';

export const ChatPage = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#020817] text-slate-100">
            {/* subtle background glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.9),transparent_40%)]" />

            <Sidebar />

            <main className="relative flex min-w-0 flex-1 flex-col">
                <ChatWindow />
            </main>
        </div>
    );
};