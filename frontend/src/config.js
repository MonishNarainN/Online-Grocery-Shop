// Fallback to the Render URL provided in your screenshot if environment variables are missing or corrupted
const fallbackUrl = 'https://online-grocery-shop-8b3u.onrender.com';

// Detect if the environment variable is actually set to the literal string "${API_URL}" (can happen in misconfigured CI/CD)
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl || envUrl === '${API_URL}' || envUrl === '') {
        return `${fallbackUrl}/api`;
    }
    return envUrl;
};

export const API_URL = getApiUrl();
export const BASE_URL = import.meta.env.VITE_BASE_URL && import.meta.env.VITE_BASE_URL !== '${BASE_URL}'
    ? import.meta.env.VITE_BASE_URL
    : fallbackUrl;

export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || API_URL.replace('/api', '/api/chat');

console.log('🚀 Config initialized:', { API_URL, CHAT_API_URL });