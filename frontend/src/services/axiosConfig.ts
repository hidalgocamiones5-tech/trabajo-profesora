import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT Authorization header and log request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[📡 API Frontend] Enviando ${config.method?.toUpperCase()} a ${config.url}`);
    return config;
  },
  (error) => {
    console.error(`[📡 API Frontend] Error en petición:`, error);
    return Promise.reject(error);
  }
);

// Interceptor to log responses
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[✅ API Frontend] Recibido ${response.status} de ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : 'Red/Desconocido';
    console.error(`[❌ API Frontend] Error ${status} al consultar ${error.config?.url}`);
    
    if (status === 401) {
      console.warn('[⚠️ API Frontend] Sesión expirada o inválida. Cerrando sesión automáticamente...');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
