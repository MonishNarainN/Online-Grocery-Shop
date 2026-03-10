const RENDER_URL = 'https://online-grocery-shop-8b3u.onrender.com';

const getApiUrl = () => {
    let envUrl = import.meta.env.VITE_API_URL || '';

    // Fallback if env is broken or undefined
    if (!envUrl || envUrl.includes('${API_URL}') || envUrl.includes('undefined')) {
        return RENDER_URL + '/api';
    }

    // --- Normalization Logic ---
    // 1. Remove trailing slashes
    envUrl = envUrl.replace(/\/+$/, '');

    // 2. Ensure it doesn't end with /api/api
    if (envUrl.endsWith('/api/api')) {
        envUrl = envUrl.replace(/\/api\/api$/, '/api');
    }

    return envUrl;
};

export const API_URL = getApiUrl();
export const BASE_URL = (import.meta.env.VITE_BASE_URL || RENDER_URL).replace(/\/+$/, '');
export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || API_URL.replace(/\/api$/, '') + '/api/chat';

console.log('Config loaded:', { API_URL, BASE_URL });