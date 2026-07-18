import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import client from '../api/client';
import { useFeedback } from '../context/FeedbackContext';
import AuthShell from '../components/ui/AuthShell';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';

export default function Register() {
  const navigate = useNavigate();
  const { showError } = useFeedback();
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '' });
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await client.post('/auth/register', { ...form, rol: 'estudiante' });
      setExito(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al registrarse.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell title="Crear cuenta" subtitle="Regístrate para iniciar tu homologación" icon={UserPlus}>
      {exito ? (
        <div className="flex flex-col items-center text-center py-6">
          <div className="relative w-24 h-24 mb-4 animate-scale-in">
            <div className="absolute inset-0 rounded-full bg-success-100 blur-xl" aria-hidden="true" />
            <img src="/img/Iaaprobada.svg" alt="" className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(2,42,138,0.2)]" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-success-700 font-semibold text-lg mb-1.5">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            ¡Cuenta creada con éxito!
          </span>
          <p className="text-sm text-ink-500">Redirigiendo a inicio de sesión...</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre"
                icon={User}
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
              <Input
                label="Apellido"
                icon={User}
                type="text"
                name="apellido"
                placeholder="Tu apellido"
                value={form.apellido}
                onChange={handleChange}
                required
              />
            </div>

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
              placeholder="Crea una contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              loading={cargando}
              className="w-full mt-1 hover:-translate-y-0.5 active:translate-y-0"
            >
              {cargando ? 'Registrando...' : 'Crear cuenta'}
              {!cargando && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-ink-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-700 hover:underline font-semibold">
              Inicia sesión
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
