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

export const MessageInput = ({
    chatId,
    editMode,
    onEditComplete
}: MessageInputProps) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSending, setIsSending] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        connection,
        replyToMessage,
        setReplyToMessage
    } = useChatStore();

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

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    }, [editMode]);

    const handleSend = async () => {
        if ((!text.trim() && !file) || isSending) return;

        const messageText = text.trim();
        const parentId = replyToMessage?.id;

        setIsSending(true);

        try {
            if (editMode) {
                await messageApi.editMessage(
                    editMode.id,
                    messageText
                );

                onEditComplete();
                setText('');
            } else if (file) {
                await messageApi.sendFile({
                    chatId,
                    file,
                    description:
                        messageText || undefined,
                    parentMessageId: parentId
                });

                setFile(null);
                setText('');
                setReplyToMessage(null);
            } else {
                setText('');
                setReplyToMessage(null);

                await sendOptimisticText(
                    chatId,
                    messageText,
                    parentId
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);

            if (textareaRef.current) {
                textareaRef.current.style.height =
                    'auto';
            }
        }
    };

    const onKeyDown = (
        e: React.KeyboardEvent
    ) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }

        if (e.key === 'Escape') {
            setReplyToMessage(null);
        }

        if (
            connection &&
            text.length > 0 &&
            text.length % 5 === 0 &&
            !editMode
        ) {
            connection.invoke(
                'SendTyping',
                chatId
            );
        }
    };

    return (
        <div className="border-t border-slate-800 bg-slate-900/50 p-2.5">
            {replyToMessage && (
                <div className="animate-in slide-in-from-bottom-1 mb-1.5 flex items-center justify-between rounded-md border-l-2 border-blue-500 bg-slate-800/80 p-1.5">
                    <div className="min-w-0 px-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-blue-400">
                            Replying to{' '}
                            {
                                replyToMessage.senderName
                            }
                        </span>

                        <p className="truncate text-[11px] text-slate-300">
                            {replyToMessage.content ||
                                'Attachment'}
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setReplyToMessage(null)
                        }
                        className="p-1 text-slate-500 transition-colors hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {file && (
                <div className="animate-in fade-in slide-in-from-bottom-2 mb-1.5 flex items-center justify-between rounded-md bg-slate-800 p-1.5">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <Paperclip
                            size={12}
                            className="text-blue-400"
                        />

                        <span className="truncate text-[11px] text-slate-300">
                            {file.name}
                        </span>
                    </div>

                    <button
                        onClick={() =>
                            setFile(null)
                        }
                        className="text-slate-500 transition-colors hover:text-white"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-1.5 rounded-xl border border-slate-700/50 bg-slate-800/50 p-1.5 transition-all focus-within:border-blue-500/50">
                {!editMode && (
                    <>
                        <button
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            className="p-1.5 text-slate-400 transition-colors hover:text-blue-400"
                        >
                            <Paperclip size={16} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={e =>
                                setFile(
                                    e.target.files?.[0] ||
                                        null
                                )
                            }
                        />
                    </>
                )}

                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={e => {
                        setText(e.target.value);

                        e.target.style.height =
                            'auto';

                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={
                        editMode
                            ? 'Edit message...'
                            : 'Write a message...'
                    }
                    className="custom-scrollbar max-h-24 flex-1 resize-none border-none bg-transparent py-1.5 text-[13px] text-slate-200 outline-none"
                />

                <button
                    onClick={handleSend}
                    disabled={
                        (!text.trim() && !file) ||
                        isSending
                    }
                    className={`rounded-lg p-1.5 transition-all ${
                        (text.trim() || file) &&
                        !isSending
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:scale-105'
                            : 'cursor-not-allowed text-slate-600'
                    }`}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};