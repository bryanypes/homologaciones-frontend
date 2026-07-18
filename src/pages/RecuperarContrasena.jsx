import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, MailCheck, KeyRound } from 'lucide-react';
import client from '../api/client';
import { useFeedback } from '../context/FeedbackContext';
import AuthShell from '../components/ui/AuthShell';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';

export default function RecuperarContrasena() {
  const { showError } = useFeedback();
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await client.post('/usuarios/recuperacion/solicitar', { email });
      setEnviado(true);
    } catch (err) {
      showError(err.response?.data?.detail || 'No se pudo procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecerla" icon={KeyRound}>
      {enviado ? (
        <div className="flex flex-col items-center text-center py-6">
          <div className="relative w-20 h-20 mb-4 animate-scale-in">
            <div className="absolute inset-0 rounded-full bg-primary-100 blur-xl" aria-hidden="true" />
            <div className="relative z-10 w-full h-full rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700">
              <MailCheck className="w-8 h-8" aria-hidden="true" />
            </div>
          </div>
          <p className="font-semibold text-ink-900 mb-1.5">Revisa tu correo</p>
          <p className="text-sm text-ink-500 max-w-xs">
            Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos.
          </p>
          <Link to="/login" className="mt-6 text-sm font-semibold text-primary-700 hover:underline">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              icon={Mail}
              type="email"
              name="email"
              placeholder="ejemplo@universidad.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={cargando} className="w-full mt-1 hover:-translate-y-0.5 active:translate-y-0">
              {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              {!cargando && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-ink-500">
            ¿Recordaste tu contraseña?{' '}
            <Link to="/login" className="text-primary-700 hover:underline font-semibold">
              Inicia sesión
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
