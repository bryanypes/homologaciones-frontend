import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const navigate = useNavigate();
  const { rol, actualizarNombre } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [infoForm, setInfoForm] = useState({ nombre: '', apellido: '' });
  const [guardandoInfo, setGuardandoInfo] = useState(false);
  const [infoExito, setInfoExito] = useState(null);
  const [infoError, setInfoError] = useState(null);

  const [passForm, setPassForm] = useState({ password_actual: '', password_nueva: '', confirmar: '' });
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [passExito, setPassExito] = useState(null);
  const [passError, setPassError] = useState(null);

  const rutaVolver = rol === 'coordinador'
    ? '/coordinador/solicitudes'
    : rol === 'rector'
      ? '/rector/solicitudes'
      : '/solicitudes';

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
    setInfoExito(null);
    setInfoError(null);
    try {
      const { data } = await client.patch('/usuarios/perfil/mio', {
        nombre: infoForm.nombre,
        apellido: infoForm.apellido,
      });
      setPerfil(data);
      actualizarNombre(`${data.nombre} ${data.apellido}`);
      setInfoExito('Información actualizada correctamente.');
    } catch (err) {
      setInfoError(err.response?.data?.detail || 'Error al actualizar la información.');
    } finally {
      setGuardandoInfo(false);
    }
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    setPassExito(null);
    setPassError(null);
    if (passForm.password_nueva !== passForm.confirmar) {
      setPassError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (passForm.password_nueva.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setGuardandoPass(true);
    try {
      await client.patch('/usuarios/perfil/mio', {
        password_actual: passForm.password_actual,
        password_nueva: passForm.password_nueva,
      });
      setPassForm({ password_actual: '', password_nueva: '', confirmar: '' });
      setPassExito('Contraseña cambiada correctamente.');
    } catch (err) {
      setPassError(err.response?.data?.detail || 'Error al cambiar la contraseña.');
    } finally {
      setGuardandoPass(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-gray-50"><Navbar /><Spinner /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(rutaVolver)} className="text-gray-400 hover:text-gray-600 text-sm">
            {'<-'} Volver
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Mi perfil</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
          <h2 className="font-medium text-gray-800 mb-1">Información de la cuenta</h2>
          <p className="text-xs text-gray-400 mb-4">El correo no puede modificarse.</p>

          <div className="mb-4">
            <p className="text-xs text-gray-400">Correo</p>
            <p className="text-sm text-gray-700 font-medium">{perfil?.email}</p>
          </div>

          {infoExito && (
            <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              {infoExito}
            </div>
          )}
          {infoError && (
            <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {infoError}
            </div>
          )}

          <form onSubmit={handleGuardarInfo} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={infoForm.nombre}
                onChange={(e) => setInfoForm({ ...infoForm, nombre: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input
                type="text"
                value={infoForm.apellido}
                onChange={(e) => setInfoForm({ ...infoForm, apellido: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={guardandoInfo}
                className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
              >
                {guardandoInfo ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6">
          <h2 className="font-medium text-gray-800 mb-4">Cambiar contraseña</h2>

          {passExito && (
            <div className="mb-3 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
              {passExito}
            </div>
          )}
          {passError && (
            <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {passError}
            </div>
          )}

          <form onSubmit={handleGuardarPassword} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
              <input
                type="password"
                value={passForm.password_actual}
                onChange={(e) => setPassForm({ ...passForm, password_actual: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                value={passForm.password_nueva}
                onChange={(e) => setPassForm({ ...passForm, password_nueva: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                value={passForm.confirmar}
                onChange={(e) => setPassForm({ ...passForm, confirmar: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={guardandoPass}
                className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
              >
                {guardandoPass ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
