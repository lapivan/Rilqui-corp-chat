// src/components/MessageContent.tsx
import { MessageType, type MessageDto } from '../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FileText, Download, FileVideo } from 'lucide-react';
import { getFullUrl } from '../utils/urlHelpers';

export const MessageContent = ({ message }: { message: MessageDto }) => {
    const isEdited = false; // Потом прикрутишь из message.updatedAt, если нужно

    const renderText = (content: string) => (
        <div className="relative">
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap inline">{content}</p>
            {isEdited && (
                <span className="text-[10px] opacity-50 ml-2 italic select-none" title="Edited">
                    (изм.)
                </span>
            )}
        </div>
    );

    // Если это просто текст или нет файла, рендерим только текст
    if (message.type === MessageType.Text || !message.fileUrl) {
        return renderText(message.content || '');
    }

    const fullUrl = getFullUrl(message.fileUrl);
    const fileName = message.fileName || 'file';
    
    // Определяем тип файла по расширению
    const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isVideo = fileName.match(/\.(mp4|webm|ogg|mov)$/i);
    const fileSizeKB = message.fileSize ? (message.fileSize / 1024).toFixed(1) : 'Unknown';

    return (
        <div className="space-y-2">
            {isImage ? (
                <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/50">
                    <img 
                        src={fullUrl} 
                        alt={fileName} 
                        className="max-w-full max-h-80 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                        onClick={() => window.open(fullUrl, '_blank')}
                    />
                </div>
            ) : isVideo ? (
                <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/50">
                    <video 
                        src={fullUrl} 
                        controls 
                        preload="metadata"
                        className="max-w-full max-h-80 object-contain"
                    />
                </div>
            ) : (
                // Стандартная карточка для документов, архивов и т.д.
                <a 
                    href={fullUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    download={fileName} // Подсказка браузеру на скачивание
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 transition-colors group"
                >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
                        <p className="text-xs text-slate-500">{fileSizeKB} KB</p>
                    </div>
                    <Download size={18} className="text-slate-500 group-hover:text-slate-300" />
                </a>
            )}
            
            {/* Подпись к файлу/картинке, если есть */}
            {message.content && renderText(message.content)}
        </div>
    );
};