import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layers, GraduationCap, Clock3, CheckCircle2, Trash2 } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import UploadPDF from '../../components/UploadPDF';
import Spinner from '../../components/Spinner';
import AIProcessingScreen from '../../components/AIProcessingScreen';
import AIMessage from '../../components/AIMessage';
import ObservationsPanel from '../../components/ObservationsPanel';
import Timeline from '../../components/Timeline';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import StatTile from '../../components/ui/StatTile';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { cn } from '../../lib/cn';
import { formatFecha } from '../../lib/format';
import { ESTADO_HERO } from '../../lib/estadoHero';

const ESTADOS_CON_HOMOLOGACION = ['revision_coordinador', 'pendiente_rector', 'aprobada', 'rechazada'];

const ETIQUETA_ESTADO_ASIG = {
  homologada: 'Homologadas',
  homologada_parcial: 'Homologadas parcial',
  pendiente: 'Pendientes',
  no_homologada: 'No homologadas',
};

const COLOR_ESTADO_ASIG = {
  homologada: 'bg-success-600',
  homologada_parcial: 'bg-accent-500',
  pendiente: 'bg-accent-300',
  no_homologada: 'bg-danger-500',
};

export default function DetalleSolicitud() {
  const { id } = useParams();
  const { nombre: nombreAuth } = useAuth();
  const { showError, showSuccess } = useFeedback();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [documentosState, setDocumentosState] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [eliminando, setEliminando] = useState(new Set());
  const [confirmarEliminarDoc, setConfirmarEliminarDoc] = useState(null);

  const cargarDocumentos = async () => {
    const endpoints = [`/documentos/${id}`, `/solicitudes/${id}/documentos`];
    for (const endpoint of endpoints) {
      try {
        const { data } = await client.get(endpoint);
        const docs = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
        setDocumentosState(docs);
        return;
      } catch (err) {
        if (err.response?.status === 404) {
          continue;
        }
        console.warn('Error al cargar documentos:', err);
        return;
      }
    }
  };

  const cargarResumen = async (estado) => {
    if (!ESTADOS_CON_HOMOLOGACION.includes(estado)) return;
    try {
      const { data } = await client.get(`/homologaciones/${id}/resumen`);
      setResumen(data);
    } catch (err) {
      if (err.response?.status !== 404) console.warn('Error al cargar el resumen de homologación:', err);
    }
  };

  const cargar = async () => {
    try {
      const { data: sol } = await client.get(`/solicitudes/${id}`);
      setSolicitud(sol);
      await cargarResumen(sol.estado);
    } catch (err) {
      console.warn('Error al cargar solicitud:', err);
      setErrorCarga('No se pudo cargar la solicitud.');
      setCargando(false);
      return;
    }

    await cargarDocumentos();

    try {
      const { data: hist } = await client.get(`/solicitudes/${id}/historial`);
      setHistorial(Array.isArray(hist) ? hist : []);
    } catch {
      setHistorial([]);
    }

    setCargando(false);
  };

  useEffect(() => { cargar(); }, [id]);

  const handleSubirNotas = async () => {
    if (!archivoPDF) return;
    setSubiendo(true);
    setProgresoSubida(0);
    try {
      const formData = new FormData();
      formData.append('file', archivoPDF);
      await client.post(`/documentos/${id}/notas`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgresoSubida(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      showSuccess('Notas subidas correctamente.');
      setArchivoPDF(null);
      cargar();
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Error al subir el archivo.';
      showError(detail);
    } finally {
      setSubiendo(false);
      setProgresoSubida(0);
    }
  };

  const handleDescargar = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nombre_original ?? 'documento.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Error al descargar el documento.');
    }
  };

  const handleEliminar = async (doc) => {
    setEliminando((prev) => new Set([...prev, doc.id]));
    try {
      await client.delete(`/documentos/${id}/${doc.id}`);
      cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al eliminar el documento.');
    } finally {
      setEliminando((prev) => { const n = new Set(prev); n.delete(doc.id); return n; });
      setConfirmarEliminarDoc(null);
    }
  };

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      try {
        await client.patch(`/solicitudes/${id}/enviar`);
      } catch (err) {
        if (err.response?.status === 405) {
          await client.post(`/solicitudes/${id}/enviar`);
        } else {
          throw err;
        }
      }
      showSuccess('Solicitud enviada correctamente.');
      cargar();
    } catch (err) {
      showError(err.response?.data?.detail || err.message || 'Error al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><Spinner fullScreen /></div>;

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Alert tone="danger" className="mb-4">{errorCarga || 'No se encontró la solicitud.'}</Alert>
          <Button onClick={() => navigate('/solicitudes')}>Volver a solicitudes</Button>
        </main>
      </div>
    );
  }

  const val = (v) => v ?? 'No especificado';
  const documentos = solicitud?.documentos ?? documentosState;
  const puedeSubirDocs = ['borrador', 'enviada', 'en_revision'].includes(solicitud?.estado);
  const notasSubidas = documentos.filter((d) => d.tipo?.toLowerCase() === 'pensum_origen');
  const tieneNotas = notasSubidas.length > 0;
  const hayCupoDocs = notasSubidas.length < 4;
  const nombreEstudiante = solicitud.estudiante?.nombre
    || solicitud.nombre
    || solicitud.estudiante_nombre
    || solicitud.nombre_estudiante
    || solicitud.estudiante?.name
    || solicitud.name
    || nombreAuth;

  const procesando = solicitud.estado === 'procesando_ia';
  const hero = !procesando ? ESTADO_HERO[solicitud.estado] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Detalle de solicitud"
          onBack={() => navigate('/solicitudes')}
          action={<EstadoBadge estado={solicitud.estado} />}
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 -mt-3 mb-5">
          {solicitud.id && <span className="font-mono">ID #{String(solicitud.id).slice(0, 8)}</span>}
          {solicitud.creado_en && (
            <>
              <span aria-hidden="true">·</span>
              <span>Creada el {formatFecha(solicitud.creado_en)}</span>
            </>
          )}
        </div>

        {procesando && (
          <Card className="mb-5">
            <AIProcessingScreen
              title="Analizando la información académica..."
              subtitle="La Inteligencia Artificial está comparando tus materias con el pensum del programa destino. Puede tardar hasta un minuto."
            />
          </Card>
        )}

        {hero && (
          <Card className={cn(
            'mb-5',
            hero.tono === 'success' && 'border-success-200',
            hero.tono === 'danger' && 'border-danger-200',
          )}>
            <AIMessage
              mascot={hero.mascot}
              size="lg"
              decorate
              animate={hero.pulse ? 'animate-pulse' : 'animate-float'}
            >
              <p className={cn(
                'font-medium',
                hero.tono === 'success' ? 'text-success-700' : hero.tono === 'danger' ? 'text-danger-700' : 'text-ink-900',
              )}>{hero.titulo}</p>
              <p className="text-sm text-ink-500 mt-0.5">{hero.detalle || (hero.tono === 'danger' && solicitud.observaciones)}</p>
            </AIMessage>
          </Card>
        )}

        {resumen && (
          <Card className="mb-5">
            <CardHeader title="Resultado del análisis" subtitle="Estadísticas generales de la comparación entre tus materias y el programa destino." />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatTile icon={Layers} value={resumen.estadisticas.total_asignaturas} label="Materias analizadas" tone="primary" />
              <StatTile
                icon={CheckCircle2}
                value={(resumen.por_estado.homologada?.cantidad ?? 0) + (resumen.por_estado.homologada_parcial?.cantidad ?? 0)}
                label="Materias homologadas"
                tone="success"
              />
              <StatTile icon={Clock3} value={resumen.por_estado.pendiente?.cantidad ?? 0} label="Materias por revisar" tone="accent" />
              <StatTile
                icon={GraduationCap}
                value={resumen.estadisticas.total_creditos_homologados}
                label="Créditos homologados"
                tone="success"
              />
            </div>

            <ObservationsPanel titulo="Esto es lo que encontró la IA" texto={resumen.resumen_ia} className="mb-4" />

            {resumen.estadisticas.total_asignaturas > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">Distribución por estado</p>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(resumen.por_estado)
                    .filter(([, info]) => info.cantidad > 0)
                    .map(([estado, info]) => {
                      const pct = Math.round((info.cantidad / resumen.estadisticas.total_asignaturas) * 100);
                      return (
                        <div key={estado} className="flex items-center gap-3 text-sm">
                          <span className="w-36 shrink-0 text-ink-600 truncate">{ETIQUETA_ESTADO_ASIG[estado] ?? estado}</span>
                          <div
                            className="flex-1 h-2.5 rounded-full bg-ink-100 overflow-hidden"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${ETIQUETA_ESTADO_ASIG[estado] ?? estado}: ${info.cantidad} de ${resumen.estadisticas.total_asignaturas}`}
                          >
                            <div className={cn('h-full rounded-full', COLOR_ESTADO_ASIG[estado] ?? 'bg-ink-300')} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-16 shrink-0 text-right text-ink-500 tabular-nums" aria-hidden="true">{info.cantidad} · {pct}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <Card>
            <CardHeader title="Información de la solicitud" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Nombre', val(nombreEstudiante)],
                ['Cédula', val(solicitud.cedula)],
                ['Teléfono', val(solicitud.telefono)],
                ['Correo de contacto', val(solicitud.correo_contacto)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-ink-400 text-xs">{label}</p>
                  <p className="text-ink-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-ink-100">
              {[
                ['Institución origen', val(solicitud.institucion_origen)],
                ['Programa origen', val(solicitud.programa_origen)],
                ['Institución destino', val(solicitud.institucion_destino)],
                ['Programa destino', val(solicitud.programa_destino)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-ink-400 text-xs">{label}</p>
                  <p className="text-ink-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Documentos"
              action={puedeSubirDocs && (
                <span className="text-xs text-ink-400">{notasSubidas.length}/4 archivos</span>
              )}
            />

            <div className="flex flex-col gap-3">
              {documentos.map((doc) => (
                <UploadPDF
                  key={doc.id}
                  label={doc.nombre_original ?? doc.nombre ?? 'Documento'}
                  existing={doc}
                  onDownload={() => handleDescargar(doc)}
                  onRemove={puedeSubirDocs ? () => setConfirmarEliminarDoc(doc) : undefined}
                  disabled={eliminando.has(doc.id)}
                />
              ))}

              {!documentos.length && (
                <AIMessage mascot="/img/IAseñalandoderecha.svg" size="sm" className="mb-1">
                  Aún no has subido tus notas académicas. Súbelas aquí para que pueda comenzar a comparar tus materias.
                </AIMessage>
              )}

              {puedeSubirDocs && (
                hayCupoDocs ? (
                  <>
                    <UploadPDF
                      label="Agregar notas académicas"
                      hint="Solo PDF."
                      onFile={setArchivoPDF}
                      file={archivoPDF}
                      onRemove={() => setArchivoPDF(null)}
                      status={subiendo ? 'uploading' : undefined}
                      progress={progresoSubida}
                    />
                    {archivoPDF && !subiendo && (
                      <Button onClick={handleSubirNotas} className="self-start">
                        Subir documento
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-ink-400">Límite de 4 archivos alcanzado. Quita uno para subir otro.</p>
                )
              )}
            </div>
          </Card>
        </div>

        {solicitud.estado === 'borrador' && (
          <Card className="mt-5">
            <CardHeader title="Enviar solicitud" subtitle="Una vez enviada, no podrás modificar la solicitud." />
            {!tieneNotas && (
              <Alert tone="warning" className="mb-3">Debes subir tu certificado de notas antes de enviar la solicitud.</Alert>
            )}
            <Button variant="success" onClick={handleEnviar} loading={enviando} disabled={!tieneNotas}>
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </Card>
        )}

        {historial.length > 0 && (
          <Card className="mt-5">
            <CardHeader title="Historial de estados" />
            <Timeline eventos={historial} />
          </Card>
        )}
      </main>

      <ConfirmModal
        open={!!confirmarEliminarDoc}
        title="Eliminar documento"
        message={confirmarEliminarDoc ? `¿Eliminar "${confirmarEliminarDoc.nombre_original ?? confirmarEliminarDoc.nombre ?? 'este documento'}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        tone="danger"
        icon={Trash2}
        loading={confirmarEliminarDoc ? eliminando.has(confirmarEliminarDoc.id) : false}
        onConfirm={() => handleEliminar(confirmarEliminarDoc)}
        onCancel={() => setConfirmarEliminarDoc(null)}
      />
    </div>
  );
}
