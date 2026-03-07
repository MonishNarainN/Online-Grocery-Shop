// Fallback to your Render URL if environment variables are missing
const RENDER_URL = 'https://online-grocery-shop-8b3u.onrender.com';

const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    // If VITE_API_URL is missing, or set to the literal string "${API_URL}"
    if (!envUrl || envUrl.includes('${API_URL}') || envUrl.includes('undefined')) {
        return `${RENDER_URL}/api`;
    }
    return envUrl;
};

export const API_URL = getApiUrl();

export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || API_URL.replace('/api', '/api/chat');

export const BASE_URL = import.meta.env.VITE_BASE_URL && !import.meta.env.VITE_BASE_URL.includes('${')
    ? import.meta.env.VITE_BASE_URL
    : RENDER_URL;

console.log('🚀 API Configuration:', {
    API_URL,
    CHAT_API_URL,
    BASE_URL,
    usingFallback: !import.meta.env.VITE_API_URL
});