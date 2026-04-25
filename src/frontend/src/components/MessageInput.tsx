import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { messageApi } from '../api/messageApi';
import { useChatStore } from '../store/chatStore';
import { useMessageStore } from '../store/messageStore';
import type { MessageDto } from '../types';

interface MessageInputProps {
    chatId: string;
    editMode: MessageDto | null;
    onEditComplete: () => void;
}

export const MessageInput = ({ chatId, editMode, onEditComplete }: MessageInputProps) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const { connection } = useChatStore();
    const { sendOptimisticText } = useMessageStore();

    useEffect(() => {
        if (editMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setText(editMode.content);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        } else {
            setText('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
    }, [editMode]);

    const handleSend = async () => {
        if ((!text.trim() && !file) || isSending) return;

        const messageText = text.trim();
        
        if (editMode) {
            setIsSending(true);
            try {
                await messageApi.editMessage(editMode.id, messageText);
                onEditComplete();
                setText('');
            } catch (error) {
                console.error("Failed to edit message", error);
            } finally {
                setIsSending(false);
            }
        } else if (file) {
            setIsSending(true);
            try {
                await messageApi.sendFile({
                    chatId,
                    file,
                    description: messageText || undefined
                });
                setFile(null);
                setText('');
            } catch (error) {
                console.error("Failed to send file", error);
            } finally {
                setIsSending(false);
            }
        } else {
            setText('');
            await sendOptimisticText(chatId, messageText);
        }

        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (connection && text.length > 0 && text.length % 5 === 0 && !editMode) {
            connection.invoke("SendTyping", chatId);
        }
    };

    return (
        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            {file && (
                <div className="mb-2 p-2 bg-slate-800 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip size={14} className="text-blue-400" />
                        <span className="text-xs text-slate-300 truncate">{file.name}</span>
                    </div>
                    <button onClick={() => setFile(null)} className="text-slate-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <div className="flex items-end gap-2 bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50 focus-within:border-blue-500/50 transition-all">
                {!editMode && (
                    <>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                            <Paperclip size={22} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </>
                )}
                
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={editMode ? "Edit message..." : "Write a message..."}
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 max-h-32 resize-none text-slate-200 custom-scrollbar"
                />

                <button 
                    onClick={handleSend}
                    disabled={(!text.trim() && !file) || isSending}
                    className={`p-2 rounded-xl transition-all ${
                        (text.trim() || file) && !isSending 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:scale-105' 
                        : 'text-slate-600 cursor-not-allowed'
                    }`}
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};