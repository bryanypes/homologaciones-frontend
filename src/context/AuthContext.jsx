import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [rol, setRol] = useState(() => localStorage.getItem('rol'));
  const [nombre, setNombre] = useState(() => localStorage.getItem('nombre'));

  const login = (tokenValue, rolValue, nombreValue) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('rol', rolValue);
    localStorage.setItem('nombre', nombreValue);
    setToken(tokenValue);
    setRol(rolValue);
    setNombre(nombreValue);
  };

  const actualizarNombre = (nuevoNombre) => {
    localStorage.setItem('nombre', nuevoNombre);
    setNombre(nuevoNombre);
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch (_) {
      // Si falla el logout en el servidor, igual limpiamos local
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      setToken(null);
      setRol(null);
      setNombre(null);
    }
  };

  return (
    <AuthContext.Provider value={{ token, rol, nombre, login, logout, actualizarNombre }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}