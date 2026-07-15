import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import Spinner from '../../components/Spinner';

const DESTINO_AUTONOMA = 'Corporación Universitaria Autónoma del Cauca';

export default function MisSolicitudes() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.get('/solicitudes/')
      .then(({ data }) => setSolicitudes(data.items ?? data))
      .catch(() => setError('No se pudieron cargar las solicitudes.'))
      .finally(() => setCargando(false));
  }, []);

  const tieneActivaActiva = solicitudes.some((s) => s.estado !== 'rechazada');

  const normalizeSolicitud = (s) => {
    const solicitudId = s.id ?? s._id ?? s.uuid ?? '';
    const swapped = s.institucion_origen === DESTINO_AUTONOMA && s.institucion_destino !== DESTINO_AUTONOMA;

    return {
      ...s,
      solicitudId,
      institucion_origen: swapped ? s.institucion_destino : s.institucion_origen,
      institucion_destino: swapped ? s.institucion_origen : s.institucion_destino,
      programa_origen: swapped ? s.programa_destino : s.programa_origen,
      programa_destino: swapped ? s.programa_origen : s.programa_destino,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Mis solicitudes</h1>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => navigate('/solicitudes/nueva')}
              disabled={tieneActivaActiva}
              title={tieneActivaActiva ? 'Ya tienes una solicitud activa. Solo puedes crear una nueva si la anterior fue rechazada.' : undefined}
              className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Nueva solicitud
            </button>
            {tieneActivaActiva && (
              <p className="text-xs text-gray-500">Ya tienes una solicitud activa.</p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {cargando ? (
          <Spinner />
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No tienes solicitudes aún.</p>
            <p className="text-sm mt-1">Crea una nueva para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institución origen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa origen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {solicitudes.map((s) => {
                  const solicitud = normalizeSolicitud(s);
                  return (
                    <tr
                      key={solicitud.solicitudId}
                      onClick={() => solicitud.solicitudId && navigate(`/solicitudes/${solicitud.solicitudId}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-700">{solicitud.institucion_origen ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{solicitud.programa_origen ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{solicitud.programa_destino ?? '—'}</td>
                      <td className="px-4 py-3"><EstadoBadge estado={solicitud.estado} /></td>
                      <td className="px-4 py-3 text-gray-500">
                        {solicitud.creado_en ? new Date(solicitud.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}