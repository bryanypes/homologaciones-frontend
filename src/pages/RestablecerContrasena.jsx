import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import client from '../api/client';
import { useFeedback } from '../context/FeedbackContext';
import AuthShell from '../components/ui/AuthShell';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';

export default function RestablecerContrasena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError } = useFeedback();
  const tokenInicial = searchParams.get('token') ?? '';
  const [form, setForm] = useState({ token: tokenInicial, password_nueva: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password_nueva !== form.confirmar) {
      showError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password_nueva.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      await client.post('/usuarios/recuperacion/restablecer', {
        token: form.token,
        password_nueva: form.password_nueva,
      });
      setExito(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showError(err.response?.data?.detail || 'El enlace no es válido o expiró.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell title="Restablecer contraseña" subtitle="Crea una nueva contraseña para tu cuenta" icon={KeyRound}>
      {exito ? (
        <div className="flex flex-col items-center text-center py-6">
          <div className="relative w-20 h-20 mb-4 animate-scale-in">
            <div className="absolute inset-0 rounded-full bg-success-100 blur-xl" aria-hidden="true" />
            <div className="relative z-10 w-full h-full rounded-full bg-success-50 border border-success-100 flex items-center justify-center text-success-700">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>
          </div>
          <p className="font-semibold text-success-700 mb-1.5">¡Contraseña restablecida!</p>
          <p className="text-sm text-ink-500">Redirigiendo a inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!tokenInicial && (
            <Input
              label="Código de recuperación"
              name="token"
              placeholder="Pega aquí el código que recibiste por correo"
              value={form.token}
              onChange={handleChange}
              required
            />
          )}
          <Input
            label="Nueva contraseña"
            icon={Lock}
            type="password"
            name="password_nueva"
            placeholder="Crea una nueva contraseña"
            value={form.password_nueva}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirmar nueva contraseña"
            icon={Lock}
            type="password"
            name="confirmar"
            placeholder="Repite la contraseña"
            value={form.confirmar}
            onChange={handleChange}
            required
          />
          <Button type="submit" loading={cargando} className="w-full mt-1 hover:-translate-y-0.5 active:translate-y-0">
            {cargando ? 'Restableciendo...' : 'Restablecer contraseña'}
            {!cargando && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
          </Button>

          <p className="text-sm text-center text-ink-500">
            <Link to="/login" className="text-primary-700 hover:underline font-semibold">
              Volver a iniciar sesión
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
