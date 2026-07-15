import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/Spinner';

const ETIQUETAS_ESTADO = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  en_revision: 'En revisión',
  procesando_ia: 'Procesando IA',
  revision_coordinador: 'Revisión coordinador',
  pendiente_rector: 'Pendiente rector',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

const COLORES_ESTADO = {
  borrador: 'bg-gray-100 text-gray-600',
  enviada: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  procesando_ia: 'bg-orange-100 text-orange-700',
  revision_coordinador: 'bg-purple-100 text-purple-700',
  pendiente_rector: 'bg-indigo-100 text-indigo-700',
  aprobada: 'bg-green-100 text-green-700',
  rechazada: 'bg-red-100 text-red-700',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await client.get('/solicitudes/estadisticas');
        setEstadisticas(data);
      } catch {
        setError('No se pudieron cargar las estadísticas.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Panel administrativo</h1>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/rector/solicitudes')}
            className="bg-white rounded-lg border border-gray-200 px-6 py-5 text-left hover:border-blue-300 hover:shadow-sm transition group"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="font-medium text-gray-800 group-hover:text-blue-700">Solicitudes</p>
            <p className="text-xs text-gray-500 mt-0.5">Ver y gestionar solicitudes de homologación</p>
          </button>
          <button
            onClick={() => navigate('/rector/usuarios')}
            className="bg-white rounded-lg border border-gray-200 px-6 py-5 text-left hover:border-blue-300 hover:shadow-sm transition group"
          >
            <p className="text-2xl mb-2">👥</p>
            <p className="font-medium text-gray-800 group-hover:text-blue-700">Usuarios</p>
            <p className="text-xs text-gray-500 mt-0.5">Crear y administrar coordinadores y rectores</p>
          </button>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6">
          <h2 className="font-medium text-gray-800 mb-5">Estadísticas de solicitudes</h2>

          {cargando ? (
            <Spinner />
          ) : estadisticas ? (
            <>
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-800">{estadisticas.total}</p>
                <p className="text-sm text-gray-500 mt-1">solicitudes en total</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(estadisticas.por_estado).map(([estado, count]) => (
                  <div key={estado} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-4">
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_ESTADO[estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ETIQUETAS_ESTADO[estado] ?? estado}
                    </span>
                  </div>
                ))}
              </div>

              {/* Barra visual proporcional */}
              {estadisticas.total > 0 && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 mb-2">Distribución</p>
                  <div className="flex h-3 rounded-full overflow-hidden gap-px">
                    {Object.entries(estadisticas.por_estado)
                      .filter(([, count]) => count > 0)
                      .map(([estado, count]) => (
                        <div
                          key={estado}
                          title={`${ETIQUETAS_ESTADO[estado] ?? estado}: ${count}`}
                          style={{ width: `${(count / estadisticas.total) * 100}%` }}
                          className={`${COLORES_ESTADO[estado]?.replace('text-\\S+', '') ?? 'bg-gray-200'} transition-all`}
                        />
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
