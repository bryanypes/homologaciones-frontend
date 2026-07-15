import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import Spinner from '../../components/Spinner';

const ESTADOS = ['', 'borrador', 'enviada', 'en_revision', 'procesando_ia', 'pendiente_rector', 'aprobada', 'rechazada'];

export default function SolicitudesCoordinador() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const POR_PAGINA = 10;

  const cargar = async (pag = 1) => {
    setCargando(true);
    try {
      const params = { page: pag, size: POR_PAGINA };
      if (filtroEstado) params.estado = filtroEstado;
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const { data } = await client.get('/solicitudes/', { params });
      setSolicitudes(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
      setPagina(pag);
    } catch {
      setError('No se pudieron cargar las solicitudes.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(1); }, [filtroEstado, fechaDesde, fechaHasta]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-gray-800 mb-6">Solicitudes</h1>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.filter(Boolean).map((e) => (
              <option key={e} value={e}>{e.replace('_', ' ')}</option>
            ))}
          </select>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {(filtroEstado || fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setFiltroEstado(''); setFechaDesde(''); setFechaHasta(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}

        {cargando ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa origen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa destino</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {solicitudes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay solicitudes.</td>
                    </tr>
                  ) : solicitudes.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/coordinador/solicitudes/${s.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-gray-700">{s.estudiante?.nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{s.programa_origen ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{s.programa_destino ?? '—'}</td>
                      <td className="px-4 py-3"><EstadoBadge estado={s.estado} /></td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.creado_en ? new Date(s.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {total > POR_PAGINA && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Página {pagina} de {Math.ceil(total / POR_PAGINA)} — {total} registros</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => cargar(pagina - 1)}
                    disabled={pagina <= 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                  >Anterior</button>
                  <button
                    onClick={() => cargar(pagina + 1)}
                    disabled={pagina >= Math.ceil(total / POR_PAGINA)}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                  >Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}