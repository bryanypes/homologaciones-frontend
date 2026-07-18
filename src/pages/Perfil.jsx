import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import PageHeader from '../components/ui/PageHeader';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';

export default function Perfil() {
  const navigate = useNavigate();
  const { rol, actualizarNombre } = useAuth();
  const { showError, showSuccess } = useFeedback();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [infoForm, setInfoForm] = useState({ nombre: '', apellido: '' });
  const [guardandoInfo, setGuardandoInfo] = useState(false);

  const [passForm, setPassForm] = useState({ password_actual: '', password_nueva: '', confirmar: '' });
  const [guardandoPass, setGuardandoPass] = useState(false);

  const rutaVolver = {
    coordinador: '/coordinador/solicitudes',
    vicerrector: '/vicerrector/solicitudes',
    admin: '/admin/panel',
  }[rol] ?? '/solicitudes';

  useEffect(() => {
    client.get('/usuarios/perfil/mio')
      .then(({ data }) => {
        setPerfil(data);
        setInfoForm({ nombre: data.nombre ?? '', apellido: data.apellido ?? '' });
      })
      .catch(() => navigate(rutaVolver))
      .finally(() => setCargando(false));
  }, []);

  const handleGuardarInfo = async (e) => {
    e.preventDefault();
    setGuardandoInfo(true);
    try {
      const { data } = await client.patch('/usuarios/perfil/mio', {
        nombre: infoForm.nombre,
        apellido: infoForm.apellido,
      });
      setPerfil(data);
      actualizarNombre(`${data.nombre} ${data.apellido}`);
      showSuccess('Información actualizada correctamente.');
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al actualizar la información.');
    } finally {
      setGuardandoInfo(false);
    }
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    if (passForm.password_nueva !== passForm.confirmar) {
      showError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passForm.password_nueva.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setGuardandoPass(true);
    try {
      await client.patch('/usuarios/perfil/mio', {
        password_actual: passForm.password_actual,
        password_nueva: passForm.password_nueva,
      });
      setPassForm({ password_actual: '', password_nueva: '', confirmar: '' });
      showSuccess('Contraseña cambiada correctamente.');
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al cambiar la contraseña.');
    } finally {
      setGuardandoPass(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><Spinner fullScreen /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="Mi perfil" onBack={() => navigate(rutaVolver)} />

        <Card className="mb-4">
          <CardHeader title="Información de la cuenta" subtitle="El correo no puede modificarse." />

          <div className="mb-5">
            <p className="text-xs text-ink-400">Correo</p>
            <p className="text-sm text-ink-800 font-medium">{perfil?.email}</p>
          </div>

          <form onSubmit={handleGuardarInfo} className="flex flex-col gap-3.5">
            <Input
              label="Nombre"
              value={infoForm.nombre}
              onChange={(e) => setInfoForm({ ...infoForm, nombre: e.target.value })}
              required
            />
            <Input
              label="Apellido"
              value={infoForm.apellido}
              onChange={(e) => setInfoForm({ ...infoForm, apellido: e.target.value })}
              required
            />
            <div>
              <Button type="submit" loading={guardandoInfo}>
                {guardandoInfo ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Cambiar contraseña" />

          <form onSubmit={handleGuardarPassword} className="flex flex-col gap-3.5">
            <Input
              label="Contraseña actual"
              type="password"
              value={passForm.password_actual}
              onChange={(e) => setPassForm({ ...passForm, password_actual: e.target.value })}
              required
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={passForm.password_nueva}
              onChange={(e) => setPassForm({ ...passForm, password_nueva: e.target.value })}
              required
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={passForm.confirmar}
              onChange={(e) => setPassForm({ ...passForm, confirmar: e.target.value })}
              required
            />
            <div>
              <Button type="submit" loading={guardandoPass}>
                {guardandoPass ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
