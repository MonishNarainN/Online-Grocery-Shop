const RENDER_URL = 'https://online-grocery-shop-8b3u.onrender.com';

const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl || envUrl.includes('${API_URL}') || envUrl.includes('undefined')) {
        return RENDER_URL + '/api';
    }
    return envUrl;
};

export const API_URL = getApiUrl();
export const BASE_URL = import.meta.env.VITE_BASE_URL || RENDER_URL;
export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || API_URL.replace('/api', '/api/chat');

console.log('Config loaded:', { API_URL, BASE_URL });