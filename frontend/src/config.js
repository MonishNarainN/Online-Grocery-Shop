export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || API_URL.replace('/api', '/api/chat');
export const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
