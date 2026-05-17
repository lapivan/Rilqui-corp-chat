import { useMemo } from 'react';
import { MessageType, type MessageDto } from '../types';
import { FileText, Download } from 'lucide-react';
import { getFullUrl } from '../utils/urlHelpers';

export const MessageContent = ({ message }: { message: MessageDto }) => {
    const isEdited = useMemo(() => {
        if (!message.updatedAt) return false;
        const created = new Date(message.createdAt).getTime();
        const updated = new Date(message.updatedAt).getTime();
        return updated - created > 1000;
    }, [message.createdAt, message.updatedAt]);

    const renderText = (content: string) => (
        <div className="relative">
            {/* Уменьшили шрифт с text-sm до text-xs, сделали его более плотным */}
            <p className="text-xs leading-relaxed break-words whitespace-pre-wrap inline">{content}</p>
            {/* Немного сжали шрифт (edited) */}
            {isEdited && (
                <span 
                    className="text-[9px] opacity-50 ml-1.5 italic select-none" 
                    title={message.updatedAt ? new Date(message.updatedAt).toLocaleString() : ''}
                >
                    (edited)
                </span>
            )}
        </div>
    );

    if (message.type === MessageType.Text || !message.fileUrl) {
        return renderText(message.content || '');
    }

    const fullUrl = getFullUrl(message.fileUrl);
    const fileName = message.fileName || 'file';
    
    const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isVideo = fileName.match(/\.(mp4|webm|ogg|mov)$/i);
    const fileSizeKB = message.fileSize ? (message.fileSize / 1024).toFixed(1) : 'Unknown';

    return (
        // Уменьшили вертикальный отступ между файлом и подписью с space-y-2 до space-y-1
        <div className="space-y-1">
            {isImage ? (
                <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/50">
                    <img 
                        src={fullUrl} 
                        alt={fileName} 
                        // Снизили максимальную высоту картинки с max-h-80 (320px) до max-h-48 (192px)
                        className="max-w-full max-h-48 object-contain hover:opacity-90 transition-opacity cursor-pointer"
                        onClick={() => window.open(fullUrl, '_blank')}
                    />
                </div>
            ) : isVideo ? (
                <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/50">
                    <video 
                        src={fullUrl} 
                        controls 
                        preload="metadata"
                        // Снизили максимальную высоту видео с max-h-80 до max-h-48
                        className="max-w-full max-h-48 object-contain"
                    />
                </div>
            ) : (
                <a 
                    href={fullUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    download={fileName} 
                    // Снизили внутренние отступы с p-3 до p-1.5, скругление углов с rounded-xl до rounded-lg
                    className="flex items-center gap-2 p-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 transition-colors group"
                >
                    {/* Сжали иконку файла с w-10 h-10 до w-7 h-7 */}
                    <div className="w-7 h-7 bg-blue-500/20 rounded-md flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all flex-shrink-0">
                        <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* Снизили шрифты названия файла (с text-sm до text-xs) и его веса (с text-xs до [10px]) */}
                        <p className="text-xs font-medium text-slate-200 truncate">{fileName}</p>
                        <p className="text-[10px] text-slate-500">{fileSizeKB} KB</p>
                    </div>
                    <Download size={14} className="text-slate-500 group-hover:text-slate-300 mr-1 flex-shrink-0" />
                </a>
            )}
            
            {message.content && renderText(message.content)}
        </div>
    );
};