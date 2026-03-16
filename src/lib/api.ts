import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  console.log('🔑 API Request - Token from storage:', !!token);
  
  if (token) {
    const { state } = JSON.parse(token);
    console.log('🔑 API Request - State token:', !!state.token);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
      console.log('🔑 API Request - Authorization header set');
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
    return Promise.reject(error);
  }
);

export default api;
