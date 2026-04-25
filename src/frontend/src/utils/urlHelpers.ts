export const getFullUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    
    if (path.startsWith('http')) return path;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100/api';
    
    const hostBase = apiUrl.replace(/\/api\/?$/, '');
    
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${hostBase}${normalizedPath}`;
};