import React, { useState } from 'react';
import { getFullUrl } from '../utils/urlHelpers';

interface AvatarProps {
    url?: string | null;
    name: string;
    className?: string; // для изменения размеров, например "w-12 h-12"
}

export const Avatar = ({ url, name, className = "w-10 h-10" }: AvatarProps) => {
    const [imgError, setImgError] = useState(false);
    
    // Получаем первые буквы имени и фамилии (до 2 символов)
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '?';

    const fullUrl = getFullUrl(url);

    if (fullUrl && !imgError) {
        return (
            <img 
                src={fullUrl} 
                alt={name} 
                onError={() => setImgError(true)} // Если картинка битая, переключимся на инициалы
                className={`rounded-full object-cover bg-slate-700 ${className}`} 
            />
        );
    }

    // Заглушка с инициалами
    return (
        <div className={`rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30 select-none ${className}`}>
            {initials}
        </div>
    );
};