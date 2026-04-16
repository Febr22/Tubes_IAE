import axios from 'axios';

// 1. Buat instance axios dasar
const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Pastikan URL ini mengarah ke Django Anda
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Tambahkan Interceptor (Satpam yang menyisipkan Token)
api.interceptors.request.use(
  (config) => {
    // Ambil token dari brankas browser (localStorage)
    const token = localStorage.getItem('access_token');
    
    // Jika token ada, selipkan di header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;