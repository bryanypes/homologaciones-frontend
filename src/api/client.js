import axios from 'axios';

const client = axios.create({
  baseURL: 'https://homologaciones-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// mete el token en cada request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// si el token expira, cerramos sesion (pero no si el 401 vino del login)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;