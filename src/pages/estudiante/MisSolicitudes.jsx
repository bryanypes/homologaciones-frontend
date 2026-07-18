import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ClickableRow from '../../components/ui/ClickableRow';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { ESTADO_HERO } from '../../lib/estadoHero';

const DESTINO_AUTONOMA = 'Corporación Universitaria Autónoma del Cauca';

export default function MisSolicitudes() {
  const navigate = useNavigate();
  const { showError } = useFeedback();
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    client.get('/solicitudes/')
      .then(({ data }) => setSolicitudes(data.items ?? data))
      .catch(() => showError('No se pudieron cargar las solicitudes.'))
      .finally(() => setCargando(false));
  }, []);

  const activa = solicitudes.find((s) => s.estado !== 'rechazada');
  const tieneActivaActiva = Boolean(activa);
  const hero = activa && ESTADO_HERO[activa.estado];

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Mis solicitudes"
          action={
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={() => navigate('/solicitudes/nueva')}
                disabled={tieneActivaActiva}
                title={tieneActivaActiva ? 'Ya tienes una solicitud activa. Solo puedes crear una nueva si la anterior fue rechazada.' : undefined}
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Nueva solicitud
              </Button>
              {tieneActivaActiva && (
                <p className="text-xs text-ink-500">Ya tienes una solicitud activa.</p>
              )}
            </div>
          }
        />

        {!cargando && hero && (
          <Card
            onClick={() => navigate(`/solicitudes/${activa.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/solicitudes/${activa.id}`); } }}
            className="mb-4 flex items-center gap-4 cursor-pointer hover:shadow-float transition-shadow"
          >
            <img src={hero.mascot} alt="" className={`w-14 h-14 shrink-0 ${hero.pulse ? 'animate-pulse' : ''}`} />
            <div>
              <p className="font-medium text-ink-900">{hero.titulo}</p>
              <p className="text-sm text-ink-500 mt-0.5">{hero.detalle}</p>
            </div>
          </Card>
        )}

        {cargando ? (
          <SkeletonTable rows={4} cols={5} />
        ) : solicitudes.length === 0 ? (
          <EmptyState
            mascot="/img/Iaesperando.svg"
            title="No tienes solicitudes aún."
            description="Crea una nueva para comenzar tu proceso de homologación."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
            <table className="min-w-full divide-y divide-ink-100 text-sm">
              <thead className="bg-ink-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Institución origen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Programa origen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Programa destino</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {solicitudes.map((s) => {
                  const solicitud = normalizeSolicitud(s);
                  return (
                    <ClickableRow
                      key={solicitud.solicitudId}
                      onClick={() => solicitud.solicitudId && navigate(`/solicitudes/${solicitud.solicitudId}`)}
                    >
                      <td className="px-4 py-3.5 text-ink-700">{solicitud.institucion_origen ?? '—'}</td>
                      <td className="px-4 py-3.5 text-ink-700">{solicitud.programa_origen ?? '—'}</td>
                      <td className="px-4 py-3.5 text-ink-700">{solicitud.programa_destino ?? '—'}</td>
                      <td className="px-4 py-3.5"><EstadoBadge estado={solicitud.estado} /></td>
                      <td className="px-4 py-3.5 text-ink-500">
                        {solicitud.creado_en ? new Date(solicitud.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </ClickableRow>
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
