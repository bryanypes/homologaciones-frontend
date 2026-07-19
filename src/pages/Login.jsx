import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import client from '../api/client';
import AuthShell from '../components/ui/AuthShell';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { sanitizeEmail } from '../lib/email';

export default function Login() {
  const { login } = useAuth();
  const { showError } = useFeedback();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'email' ? sanitizeEmail(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        vicerrector: '/vicerrector/solicitudes',
        admin: '/admin/panel',
      }[role];

      if (!destination) {
        throw new Error('Rol de usuario no reconocido.');
      }

      navigate(destination);
    } catch (err) {
      showError(err.response?.data?.detail || err.message || 'Error al iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa tus credenciales para continuar" icon={LogIn}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Correo electrónico"
          icon={Mail}
          type="email"
          name="email"
          placeholder="ejemplo@universidad.edu.co"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Contraseña"
          icon={Lock}
          type="password"
          name="password"
          placeholder="Ingresa tu contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />

        <Link to="/recuperar-contrasena" className="text-sm text-primary-700 hover:underline font-medium -mt-1 self-end">
          ¿Olvidaste tu contraseña?
        </Link>

        <Button
          type="submit"
          loading={cargando}
          className="w-full mt-1 hover:-translate-y-0.5 active:translate-y-0"
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
          {!cargando && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-ink-500">
        ¿Eres estudiante y no tienes cuenta?{' '}
        <Link to="/register" className="text-primary-700 hover:underline font-semibold">
          Regístrate
        </Link>
      </p>
    </AuthShell>
  );
}
