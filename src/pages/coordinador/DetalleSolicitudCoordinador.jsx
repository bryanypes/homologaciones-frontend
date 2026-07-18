import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Layers, CheckCircle2, Clock3, FileWarning, GraduationCap } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import UploadPDF from '../../components/UploadPDF';
import Spinner from '../../components/Spinner';
import AsignaturaCard from '../../components/AsignaturaCard';
import AgregarAsignaturaForm from '../../components/AgregarAsignaturaForm';
import MateriasResumenChips from '../../components/MateriasResumenChips';
import AIMessage from '../../components/AIMessage';
import AIProcessingScreen from '../../components/AIProcessingScreen';
import DocumentoTile from '../../components/DocumentoTile';
import Timeline from '../../components/Timeline';
import ObservationsPanel from '../../components/ObservationsPanel';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import StatTile from '../../components/ui/StatTile';
import { Textarea } from '../../components/ui/Field';
import { formatFecha } from '../../lib/format';
import { obtenerCreditosPrograma } from '../../lib/programaCreditos';

const ESTADOS_CON_HOMOLOGACION = ['revision_coordinador', 'pendiente_rector', 'aprobada', 'rechazada'];

const ETIQUETAS_DOC = {
  pensum_origen: 'Notas del estudiante',
  pensum_destino: 'Pensum destino',
  homologacion_generada: 'Homologación generada',
  resolucion: 'Resolución',
};

export default function DetalleSolicitudCoordinador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useFeedback();

  const [solicitud, setSolicitud] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [homologacion, setHomologacion] = useState(null);
  const [creditosPrograma, setCreditosPrograma] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null); // { url, nombre }

  const [observacion, setObservacion] = useState('');
  const [archivoPensum, setArchivoPensum] = useState(null);
  const [archivoResolucion, setArchivoResolucion] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [subiendoResolucion, setSubiendoResolucion] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [enviandoRector, setEnviandoRector] = useState(false);
  const [descargandoResolucion, setDescargandoResolucion] = useState(false);

  const [ediciones, setEdiciones] = useState({});
  const [guardandoEdiciones, setGuardandoEdiciones] = useState(false);
  const [agregandoAsignatura, setAgregandoAsignatura] = useState(false);
  const [confirmarEliminarAsignatura, setConfirmarEliminarAsignatura] = useState(null);
  const [eliminandoAsignatura, setEliminandoAsignatura] = useState(false);

  const cargarDocumentos = async () => {
    try {
      const { data } = await client.get(`/documentos/${id}`);
      setDocumentos(Array.isArray(data) ? data : (data.items ?? []));
    } catch (err) {
      if (err.response?.status !== 404) console.warn('Error cargando documentos:', err);
    }
  };

  const cargarHomologacion = async () => {
    try {
      const { data } = await client.get(`/homologaciones/${id}`);
      setHomologacion(data);
      if (data?.asignaturas) {
        const init = {};
        data.asignaturas.forEach((a) => {
          init[a.id] = { estado: a.estado, justificacion: a.justificacion ?? '' };
        });
        setEdiciones(init);
      }
    } catch (err) {
      if (err.response?.status !== 404) console.warn('Error cargando homologación:', err);
    }
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const { data: sol } = await client.get(`/solicitudes/${id}`);
      setSolicitud(sol);
      obtenerCreditosPrograma(sol.programa_destino_id).then(setCreditosPrograma);
      await cargarDocumentos();
      if (ESTADOS_CON_HOMOLOGACION.includes(sol.estado)) {
        await cargarHomologacion();
      }
      try {
        const { data: hist } = await client.get(`/solicitudes/${id}/historial`);
        setHistorial(Array.isArray(hist) ? hist : []);
      } catch {
        setHistorial([]);
      }
    } catch {
      setErrorCarga('No se pudo cargar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const handleVerPDF = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setVistaPrevia({ url, nombre: doc.nombre_original ?? 'Documento' });
    } catch {
      showError('Error al cargar la vista previa.');
    }
  };

  const cerrarVistaPrevia = () => {
    if (vistaPrevia?.url) URL.revokeObjectURL(vistaPrevia.url);
    setVistaPrevia(null);
  };

  const handleDescargar = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nombre_original ?? doc.nombre ?? 'documento.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Error al descargar el documento.');
    }
  };

  const handleRevisar = async () => {
    try {
      await client.patch(`/solicitudes/${id}/cambiar-estado`, { observacion }, { params: { nuevo_estado: 'en_revision' } });
      showSuccess('Solicitud tomada en revisión.');
      setObservacion('');
      cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al tomar en revisión.');
    }
  };

  const handleSubirPensum = async () => {
    if (!archivoPensum) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('file', archivoPensum);
      await client.post(`/documentos/${id}/pensum-destino`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess('Pensum subido correctamente.');
      setArchivoPensum(null);
      await cargarDocumentos();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al subir el pensum.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubirResolucion = async () => {
    if (!archivoResolucion) return;
    setSubiendoResolucion(true);
    try {
      const formData = new FormData();
      formData.append('file', archivoResolucion);
      await client.post(`/documentos/${id}/resolucion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess('Resolución subida. Al generar se usará este archivo en lugar del automático.');
      setArchivoResolucion(null);
      await cargarDocumentos();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al subir la resolución.');
    } finally {
      setSubiendoResolucion(false);
    }
  };

  const handleProcesarIA = async () => {
    setProcesando(true);
    try {
      await client.post(`/homologaciones/${id}/procesar`);
      showSuccess('Análisis completado. Revisa los resultados y ajústalos antes de enviar al vicerrector.');
      await cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al procesar con IA.');
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarEdiciones = async () => {
    setGuardandoEdiciones(true);
    try {
      await Promise.all(
        (homologacion?.asignaturas ?? []).map((a) =>
          client.patch(`/homologaciones/${id}/asignaturas/${a.id}`, {
            estado: ediciones[a.id]?.estado ?? a.estado,
            justificacion: ediciones[a.id]?.justificacion || null,
          })
        )
      );
      showSuccess('Cambios guardados.');
      await cargarHomologacion();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al guardar los cambios.');
    } finally {
      setGuardandoEdiciones(false);
    }
  };

  const handleAgregarAsignatura = async (payload) => {
    setAgregandoAsignatura(true);
    try {
      await client.post(`/homologaciones/${id}/asignaturas`, payload);
      showSuccess('Asignatura agregada correctamente.');
      await cargarHomologacion();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al agregar la asignatura.');
    } finally {
      setAgregandoAsignatura(false);
    }
  };

  const handleEliminarAsignatura = async () => {
    if (!confirmarEliminarAsignatura) return;
    setEliminandoAsignatura(true);
    try {
      await client.delete(`/homologaciones/${id}/asignaturas/${confirmarEliminarAsignatura.id}`);
      showSuccess('Asignatura eliminada correctamente.');
      await cargarHomologacion();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al eliminar la asignatura.');
    } finally {
      setEliminandoAsignatura(false);
      setConfirmarEliminarAsignatura(null);
    }
  };

  const handleDescargarResolucion = async () => {
    setDescargandoResolucion(true);
    try {
      const { data } = await client.post(`/homologaciones/${id}/generar-resolucion`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resolucion_${id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Error al descargar la resolución.');
    } finally {
      setDescargandoResolucion(false);
    }
  };

  const handleEnviarRector = async () => {
    setEnviandoRector(true);
    try {
      await client.post(`/homologaciones/${id}/enviar-rector`);
      showSuccess('Solicitud enviada al vicerrector para aprobación final.');
      await cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al enviar al vicerrector.');
    } finally {
      setEnviandoRector(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><Spinner fullScreen /></div>;

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Alert tone="danger" className="mb-4">{errorCarga || 'No se encontró la solicitud.'}</Alert>
          <Button onClick={() => navigate('/coordinador/solicitudes')}>Volver</Button>
        </main>
      </div>
    );
  }

  const tieneNotas = documentos.some((d) => (d?.tipo || '').toLowerCase() === 'pensum_origen');
  const tienePensum = documentos.some((d) => (d?.tipo || '').toLowerCase() === 'pensum_destino');
  const resolucionSubida = documentos.find((d) => (d?.tipo || '').toLowerCase() === 'resolucion');
  const asignaturas = homologacion?.asignaturas ?? [];
  const mostrarResolucion = ESTADOS_CON_HOMOLOGACION.filter((e) => e !== 'rechazada').includes(solicitud.estado);

  const resumenEstados = asignaturas.reduce((acc, a) => {
    const estado = ediciones[a.id]?.estado ?? a.estado;
    acc[estado] = (acc[estado] ?? 0) + 1;
    return acc;
  }, {});
  const TONO_RESUMEN = { homologada: 'success', homologada_parcial: 'accent', pendiente: 'neutral', no_homologada: 'danger' };
  const ETIQUETA_RESUMEN = { homologada: 'homologada', homologada_parcial: 'homologada parcial', pendiente: 'pendiente', no_homologada: 'no homologada' };

  const materiasHomologadas = asignaturas.filter((a) => ['homologada', 'homologada_parcial'].includes(ediciones[a.id]?.estado ?? a.estado));
  const materiasPendientes = asignaturas.filter((a) => (ediciones[a.id]?.estado ?? a.estado) === 'pendiente');
  const creditosHomologados = materiasHomologadas.reduce((sum, a) => sum + (a.creditos_destino ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Modal open={!!vistaPrevia} onClose={cerrarVistaPrevia} title={vistaPrevia?.nombre} fullBleed>
        {vistaPrevia && <iframe src={vistaPrevia.url} className="w-full h-full" title={vistaPrevia.nombre} />}
      </Modal>

      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Detalle de solicitud"
          onBack={() => navigate('/coordinador/solicitudes')}
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

        {/* Info del estudiante + Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start mb-5">
          <Card>
            <CardHeader title="Información del estudiante" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Nombre', [solicitud.nombre_estudiante, solicitud.apellido_estudiante].filter(Boolean).join(' ') || '—'],
                ['Cédula', solicitud.cedula ?? '—'],
                ['Correo', solicitud.correo_contacto ?? '—'],
                ['Teléfono', solicitud.telefono ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-ink-400 text-xs">{label}</p>
                  <p className="text-ink-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-ink-100">
              {[
                ['Institución origen', solicitud.institucion_origen ?? '—'],
                ['Programa origen', solicitud.programa_origen ?? '—'],
                ['Institución destino', solicitud.institucion_destino ?? '—'],
                ['Programa destino', solicitud.programa_destino ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-ink-400 text-xs">{label}</p>
                  <p className="text-ink-800 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Documentos" />
            {!documentos.length ? (
              <AIMessage mascot="/img/Iaesperando.svg" size="sm">
                Aún no hay documentos subidos. Te avisaré aquí en cuanto el estudiante suba su certificado de notas.
              </AIMessage>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {documentos.map((doc, i) => (
                  <DocumentoTile
                    key={i}
                    nombre={doc.nombre_original ?? doc.nombre ?? '—'}
                    tipoLabel={ETIQUETAS_DOC[doc.tipo] ?? doc.tipo}
                    onVer={doc.tipo !== 'resolucion' ? () => handleVerPDF(doc) : undefined}
                    onDescargar={() => handleDescargar(doc)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ─── ENVIADA: tomar en revisión ─── */}
        {solicitud.estado === 'enviada' && (
          <Card className="mb-5">
            <CardHeader title="Tomar en revisión" subtitle="Al tomar en revisión podrás subir el pensum del programa destino y activar el análisis con IA." />
            <Textarea
              label="Observación"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Observación (opcional)"
              rows={3}
              className="mb-3"
            />
            <Button variant="accent" onClick={handleRevisar}>Tomar en revisión</Button>
          </Card>
        )}

        {/* ─── EN_REVISION: subir pensum + procesar ─── */}
        {solicitud.estado === 'en_revision' && (
          <Card className="mb-5">
            <CardHeader title="Preparar análisis IA" />

            {!tieneNotas ? (
              <AIMessage mascot="/img/Iaesperando.svg" size="lg" decorate className="mb-4">
                Todavía estoy esperando a que el estudiante suba su certificado de notas.
                Avísame cuando esté listo para poder comparar las materias.
              </AIMessage>
            ) : !tienePensum ? (
              <AIMessage mascot="/img/IAseñalandoderecha.svg" size="lg" decorate className="mb-4">
                Ya tengo las notas del estudiante. Ahora necesito el <strong>pensum del programa destino</strong> para
                poder comparar las materias — súbelo aquí abajo.
              </AIMessage>
            ) : (
              <AIMessage mascot="/img/Iapensando.svg" size="lg" decorate animate="animate-pulse" className="mb-4">
                Ya tengo todo lo que necesito: las notas del estudiante y el pensum destino.
                Actívame cuando quieras y comparo las materias en un momento.
              </AIMessage>
            )}

            <div className="flex flex-col gap-4">
              {!tienePensum && (
                <div>
                  <p className="text-sm font-medium text-ink-700 mb-2">Paso 1 — Subir pensum del programa destino</p>
                  <UploadPDF
                    label="Pensum destino"
                    hint="Solo PDF."
                    onFile={setArchivoPensum}
                    file={archivoPensum}
                    onRemove={() => setArchivoPensum(null)}
                    status={subiendo ? 'uploading' : undefined}
                  />
                  {archivoPensum && !subiendo && (
                    <Button onClick={handleSubirPensum} className="mt-2">Subir pensum</Button>
                  )}
                </div>
              )}

              {tienePensum && (
                <div>
                  <p className="text-sm font-medium text-ink-700 mb-2">Paso 2 — Activar análisis con IA</p>
                  <p className="text-xs text-ink-500 mb-3">El sistema analizará las notas del estudiante y el pensum destino. Puede tardar hasta 1 minuto.</p>
                  <Button variant="accent" onClick={handleProcesarIA} loading={procesando} disabled={!tieneNotas}>
                    {procesando ? 'Procesando (puede tardar 1 min)...' : 'Activar análisis IA'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ─── PROCESANDO_IA ─── */}
        {solicitud.estado === 'procesando_ia' && (
          <Card className="mb-5">
            <AIProcessingScreen
              title="La Inteligencia Artificial está comparando los planes de estudio..."
              subtitle="Estoy comparando materia por materia las notas del estudiante contra el pensum del programa destino. Puede tardar hasta un minuto."
              onRefresh={cargar}
            />
          </Card>
        )}

        {/* ─── REVISION_COORDINADOR: revisar y editar ─── */}
        {solicitud.estado === 'revision_coordinador' && (
          <Card className="mb-5">
            <CardHeader
              title="Resultado del análisis IA"
              subtitle="Revisa cada asignatura, ajusta el estado y la justificación si es necesario, y luego envía al vicerrector."
              action={<span className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full border border-primary-100">Revisión del coordinador</span>}
            />

            {asignaturas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatTile icon={Layers} value={asignaturas.length} label="Materias analizadas" tone="primary" />
                <StatTile icon={CheckCircle2} value={resumenEstados.homologada ?? 0} label="Equivalencias encontradas" tone="success" />
                <StatTile icon={Clock3} value={resumenEstados.pendiente ?? 0} label="Por revisar" tone="accent" />
                <StatTile
                  icon={GraduationCap}
                  value={creditosPrograma ? `${creditosHomologados} / ${creditosPrograma}` : creditosHomologados}
                  label="Créditos homologados"
                  tone="success"
                />
              </div>
            )}

            <MateriasResumenChips homologadas={materiasHomologadas} pendientes={materiasPendientes} />

            <ObservationsPanel titulo="Esto es lo que encontró la IA" texto={homologacion?.resumen_ia} className="mb-4" />

            <details className="mb-4 border border-ink-200 rounded-xl overflow-hidden">
              <summary className="px-4 py-3 text-sm text-ink-600 cursor-pointer hover:bg-ink-50 select-none">
                Volver a procesar con otro pensum destino
              </summary>
              <div className="px-4 pb-4 pt-3 border-t border-ink-100 flex flex-col gap-3">
                <Alert tone="warning">Atención: al reprocesar se eliminarán los resultados actuales.</Alert>
                <UploadPDF
                  label="Nuevo pensum destino"
                  hint="Solo PDF."
                  onFile={setArchivoPensum}
                  file={archivoPensum}
                  onRemove={() => setArchivoPensum(null)}
                  status={subiendo ? 'uploading' : undefined}
                />
                {archivoPensum && !subiendo && (
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleSubirPensum}>Subir pensum</Button>
                    {tienePensum && (
                      <Button variant="accent" onClick={handleProcesarIA} loading={procesando}>
                        {procesando ? 'Procesando...' : 'Reprocesar con IA'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </details>

            {asignaturas.length > 0 ? (
              <div className="flex flex-col gap-3 mb-4">
                {asignaturas.map((a) => (
                  <AsignaturaCard
                    key={a.id}
                    asignatura={a}
                    editable
                    edicion={ediciones[a.id]}
                    onChangeEstado={(v) => setEdiciones((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] ?? { estado: a.estado, justificacion: a.justificacion ?? '' }), estado: v } }))}
                    onChangeJustificacion={(v) => setEdiciones((prev) => ({ ...prev, [a.id]: { ...(prev[a.id] ?? { estado: a.estado, justificacion: a.justificacion ?? '' }), justificacion: v } }))}
                    onEliminar={() => setConfirmarEliminarAsignatura(a)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-400 mb-4">No hay asignaturas en el análisis.</p>
            )}

            <div className="mb-4">
              <AgregarAsignaturaForm onAgregar={handleAgregarAsignatura} agregando={agregandoAsignatura} />
            </div>

            {asignaturas.length > 0 && (
              <div className="rounded-xl bg-ink-50 border border-ink-100 px-4 py-4 mb-4">
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-2.5">Resumen de tu revisión</p>
                <div className="flex flex-wrap gap-2">
                  {['homologada', 'homologada_parcial', 'pendiente', 'no_homologada'].map((estado) => (
                    resumenEstados[estado] > 0 && (
                      <Badge key={estado} tone={TONO_RESUMEN[estado]}>
                        {resumenEstados[estado]} · {ETIQUETA_RESUMEN[estado]}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}

            <AIMessage mascot="/img/Iaaprobada.svg" size="lg" decorate animate="animate-float" className="mb-4">
              ¡Todo listo! Revisa los ajustes de cada asignatura y, cuando estés conforme,
              envía la solicitud al vicerrector para la decisión final.
            </AIMessage>

            <div className="flex items-center gap-3 pt-3 border-t border-ink-100 flex-wrap">
              <Button variant="secondary" onClick={handleGuardarEdiciones} loading={guardandoEdiciones}>
                {guardandoEdiciones ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button onClick={handleEnviarRector} loading={enviandoRector}>
                {enviandoRector ? 'Enviando...' : 'Enviar al vicerrector'}
              </Button>
              <p className="text-xs text-ink-400 ml-auto">Una vez enviado al vicerrector no podrás modificar los resultados.</p>
            </div>
          </Card>
        )}

        {/* ─── APROBADA ─── */}
        {solicitud.estado === 'aprobada' && (
          <Card className="mb-5 border-success-200 flex items-center gap-3">
            <img src="/img/Iaaprobada.svg" alt="" className="w-11 h-11 shrink-0" />
            <div>
              <p className="font-medium text-success-700 mb-0.5">Solicitud aprobada por el vicerrector</p>
              <p className="text-xs text-ink-500">La resolución oficial está disponible para descarga.</p>
            </div>
          </Card>
        )}

        {/* ─── Solo lectura (pendiente_rector / aprobada / rechazada) ─── */}
        {ESTADOS_CON_HOMOLOGACION.filter((e) => e !== 'revision_coordinador').includes(solicitud.estado) && homologacion && (
          <Card className="mb-5">
            <CardHeader title="Resultado del análisis" />

            {asignaturas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatTile icon={Layers} value={asignaturas.length} label="Materias analizadas" tone="primary" />
                <StatTile icon={CheckCircle2} value={resumenEstados.homologada ?? 0} label="Equivalencias encontradas" tone="success" />
                <StatTile icon={Clock3} value={resumenEstados.pendiente ?? 0} label="Por revisar" tone="accent" />
                <StatTile
                  icon={GraduationCap}
                  value={creditosPrograma ? `${creditosHomologados} / ${creditosPrograma}` : creditosHomologados}
                  label="Créditos homologados"
                  tone="success"
                />
              </div>
            )}

            <MateriasResumenChips homologadas={materiasHomologadas} pendientes={materiasPendientes} />

            <ObservationsPanel titulo="Esto es lo que encontró la IA" texto={homologacion.resumen_ia} className="mb-4" />

            {asignaturas.length > 0 && (
              <div className="flex flex-col gap-3">
                {asignaturas.map((a) => (
                  <AsignaturaCard key={a.id} asignatura={a} />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ─── Resolución ─── */}
        {mostrarResolucion && (
          <Card className="mb-5">
            <CardHeader title="Resolución oficial" subtitle="Genera la resolución automática, descárgala, edítala en Word si es necesario, y sube la versión final." />

            {!resolucionSubida && (
              <div className="flex flex-col items-center text-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/60 px-6 py-8 mb-4">
                <span className="w-11 h-11 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-400">
                  <FileWarning className="w-5 h-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-ink-700">Aún no hay una resolución generada</p>
                <p className="text-xs text-ink-500 max-w-xs">Genera la resolución automática o sube una versión editada para dejarla lista antes de enviar al vicerrector.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <UploadPDF
                label={resolucionSubida ? 'Reemplazar resolución (DOCX o PDF)' : 'Subir resolución editada (DOCX o PDF)'}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                existing={resolucionSubida}
                onDownload={resolucionSubida ? () => handleDescargar(resolucionSubida) : undefined}
                onFile={setArchivoResolucion}
                file={archivoResolucion}
                onRemove={() => setArchivoResolucion(null)}
                status={subiendoResolucion ? 'uploading' : undefined}
              />
              {archivoResolucion && !subiendoResolucion && (
                <Button onClick={handleSubirResolucion} className="self-start">Subir resolución</Button>
              )}
              <div className="pt-2 border-t border-ink-100">
                <Button onClick={handleDescargarResolucion} loading={descargandoResolucion}>
                  {!descargandoResolucion && <Download className="w-4 h-4" aria-hidden="true" />}
                  {descargandoResolucion ? 'Generando...' : resolucionSubida ? 'Descargar resolución' : 'Generar y descargar resolución'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── HISTORIAL ─── */}
        {historial.length > 0 && (
          <Card>
            <CardHeader title="Historial de estados" />
            <Timeline eventos={historial} />
          </Card>
        )}

      </main>

      <ConfirmModal
        open={!!confirmarEliminarAsignatura}
        title="Eliminar asignatura"
        message={confirmarEliminarAsignatura ? `¿Eliminar la asignatura "${confirmarEliminarAsignatura.asignatura_origen}" de la homologación? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        loading={eliminandoAsignatura}
        onConfirm={handleEliminarAsignatura}
        onCancel={() => setConfirmarEliminarAsignatura(null)}
      />
    </div>
  );
}
