import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  // Zustand persist ma'lumotlarini olish
  const authData = useAuthStore.getState();
  console.log('🔑 API Request - Auth state:', !!authData.token);
  
  if (authData.token) {
    config.headers.Authorization = `Bearer ${authData.token}`;
    console.log('🔑 API Request - Authorization header set:', `Bearer ${authData.token.substring(0, 20)}...`);
  } else {
    // Agar zustandda token bo'lmasa, localStorage ni tekshirish
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      try {
        const parsed = JSON.parse(storage);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
          console.log('🔑 API Request - Token from localStorage:', `Bearer ${parsed.state.token.substring(0, 20)}...`);
        }
      } catch (e) {
        console.error('❌ API Request - Failed to parse auth-storage:', e);
      }
    } else {
      console.warn('⚠️ API Request - No token found');
    }
  }
  console.log('🔑 API Request - URL:', config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response - Status:', response.status, 'URL:', response.config.url);
    console.log('✅ API Response - Data length:', JSON.stringify(response.data).length);
    return response;
  },
  (error) => {
    console.log('❌ API Error - Status:', error.response?.status, 'URL:', error.config?.url);
    console.log('❌ API Error - Message:', error.response?.data || error.message);
    
    // 401 xatoligida login ga yo'naltirish
    if (error.response?.status === 401) {
      console.log('🔄 Redirecting to login due to 401 error');
      // Tokenni tozalash
      localStorage.removeItem('auth-storage');
      // Login sahifasiga yo'naltirish
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
