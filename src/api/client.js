import axios from 'axios';

const client = axios.create({
  baseURL: 'https://homologaciones-api.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega el token a cada request automáticamente
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira, limpia y redirige al login
// (excepto en el propio intento de login, donde un 401 es "credenciales inválidas",
// no una sesión expirada, y debe dejarse en manos del formulario para mostrarlo)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const esIntentoDeLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esIntentoDeLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;