import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const { data } = await client.post('/auth/login', form);
      const usuario = data.usuario ?? data.user ?? {};
      const role = String(usuario.rol ?? usuario.role ?? data.rol ?? data.role ?? '').toLowerCase().trim();
      const tokenValue = data.access_token ?? data.token;
      const nombreValue = usuario.nombre ?? usuario.name ?? data.nombre ?? data.name ?? '';

      if (!tokenValue) {
        throw new Error('No se recibió token de autenticación.');
      }

      login(tokenValue, role, nombreValue);

      const destination = {
        estudiante: '/solicitudes',
        coordinador: '/coordinador/solicitudes',
        rector: '/rector/solicitudes',
      }[role];

      if (!destination) {
        throw new Error('Rol de usuario no reconocido.');
      }

      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1F3864] text-white text-center py-6 rounded-t-lg">
          <h1 className="text-lg font-semibold">Sistema de Homologaciones</h1>
          <p className="text-blue-200 text-sm mt-1">Corporación Universitaria Autónoma del Cauca</p>
        </div>

        <div className="bg-white rounded-b-lg shadow-md px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-[#1F3864] text-white py-2 rounded-md text-sm font-medium hover:bg-blue-900 transition disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-500">
            ¿Eres estudiante y no tienes cuenta?{' '}
            <Link to="/register" className="text-blue-700 hover:underline font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}