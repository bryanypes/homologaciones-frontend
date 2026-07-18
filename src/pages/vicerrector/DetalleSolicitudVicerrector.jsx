import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Check, X, Layers, CheckCircle2, Clock3, FileWarning, GraduationCap } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import UploadPDF from '../../components/UploadPDF';
import Spinner from '../../components/Spinner';
import AsignaturaCard from '../../components/AsignaturaCard';
import AgregarAsignaturaForm from '../../components/AgregarAsignaturaForm';
import MateriasResumenChips from '../../components/MateriasResumenChips';
import AIMessage from '../../components/AIMessage';
import DocumentoTile from '../../components/DocumentoTile';
import Timeline from '../../components/Timeline';
import ObservationsPanel from '../../components/ObservationsPanel';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import StatTile from '../../components/ui/StatTile';
import { Textarea } from '../../components/ui/Field';
import { formatFecha } from '../../lib/format';
import { obtenerCreditosPrograma } from '../../lib/programaCreditos';

const ETIQUETAS_DOC = {
  pensum_origen: 'Notas del estudiante',
  pensum_destino: 'Pensum destino',
  homologacion_generada: 'Homologación generada',
  resolucion: 'Resolución',
};

export default function DetalleSolicitudVicerrector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess } = useFeedback();
  const [solicitud, setSolicitud] = useState(null);
  const [creditosPrograma, setCreditosPrograma] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [homologacion, setHomologacion] = useState(null);
  const [ediciones, setEdiciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [accionando, setAccionando] = useState(false);
  const [guardandoEdiciones, setGuardandoEdiciones] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [archivoResolucion, setArchivoResolucion] = useState(null);
  const [subiendoResolucion, setSuiendoResolucion] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null); // { url, nombre }
  const [agregandoAsignatura, setAgregandoAsignatura] = useState(false);
  const [confirmarEliminarAsignatura, setConfirmarEliminarAsignatura] = useState(null);
  const [eliminandoAsignatura, setEliminandoAsignatura] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const { data: sol } = await client.get(`/solicitudes/${id}`);
      setSolicitud(sol);
      obtenerCreditosPrograma(sol.programa_destino_id).then(setCreditosPrograma);

      const [homSettled, histSettled, docsSettled] = await Promise.allSettled([
        client.get(`/homologaciones/${id}`),
        client.get(`/solicitudes/${id}/historial`),
        client.get(`/documentos/${id}`),
      ]);

      if (homSettled.status === 'fulfilled' && homSettled.value.data) {
        const hom = homSettled.value.data;
        setHomologacion(hom);
        if (hom.asignaturas) {
          const init = {};
          hom.asignaturas.forEach((a) => {
            init[a.id] = { estado: a.estado, justificacion: a.justificacion ?? '' };
          });
          setEdiciones(init);
        }
      }

      if (histSettled.status === 'fulfilled') setHistorial(histSettled.value.data ?? []);
      if (docsSettled.status === 'fulfilled') setDocumentos(docsSettled.value.data ?? []);
    } catch {
      setErrorCarga('No se pudo cargar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

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

  const handleVerPDF = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setVistaPrevia({ url, nombre: doc.nombre_original ?? 'Documento' });
    } catch {
      showError('Error al cargar la vista previa del documento.');
    }
  };

  const cerrarVistaPrevia = () => {
    if (vistaPrevia?.url) URL.revokeObjectURL(vistaPrevia.url);
    setVistaPrevia(null);
  };

  const handleSubirResolucion = async () => {
    if (!archivoResolucion) return;
    setSuiendoResolucion(true);
    try {
      const formData = new FormData();
      formData.append('file', archivoResolucion);
      await client.post(`/documentos/${id}/resolucion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showSuccess('Resolución subida. Al generar se usará este archivo.');
      setArchivoResolucion(null);
      await cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al subir la resolución.');
    } finally {
      setSuiendoResolucion(false);
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
      showSuccess('Cambios en asignaturas guardados.');
      await cargar();
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
      await cargar();
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
      await cargar();
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al eliminar la asignatura.');
    } finally {
      setEliminandoAsignatura(false);
      setConfirmarEliminarAsignatura(null);
    }
  };

  const handleAccion = async (accion) => {
    setAccionando(true);
    try {
      await client.post(`/solicitudes/${id}/${accion}`, { observacion });
      showSuccess(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.`);
      await cargar();
    } catch (err) {
      showError(err.response?.data?.detail || `Error al ${accion} la solicitud.`);
    } finally {
      setAccionando(false);
    }
  };

  const handleDescargarResolucion = async () => {
    setDescargando(true);
    try {
      const { data } = await client.post(
        `/homologaciones/${id}/generar-resolucion`,
        {},
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resolucion_${id}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showError('Error al descargar la resolución.');
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-background flex flex-col"><Navbar /><Spinner fullScreen /></div>;

  const asignaturas = homologacion?.asignaturas ?? [];
  const resolucionSubida = documentos.find((d) => (d?.tipo || '').toLowerCase() === 'resolucion');
  const resumenEstados = asignaturas.reduce((acc, a) => {
    const estado = ediciones[a.id]?.estado ?? a.estado;
    acc[estado] = (acc[estado] ?? 0) + 1;
    return acc;
  }, {});
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
          onBack={() => navigate('/vicerrector/solicitudes')}
          action={solicitud && <EstadoBadge estado={solicitud.estado} />}
        />

        {solicitud && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500 -mt-3 mb-5">
            {solicitud.id && <span className="font-mono">ID #{String(solicitud.id).slice(0, 8)}</span>}
            {solicitud.creado_en && (
              <>
                <span aria-hidden="true">·</span>
                <span>Creada el {formatFecha(solicitud.creado_en)}</span>
              </>
            )}
            {solicitud.numero_resolucion && (
              <>
                <span aria-hidden="true">·</span>
                <span>Resolución N.° {solicitud.numero_resolucion}</span>
              </>
            )}
          </div>
        )}

        {errorCarga && <Alert tone="danger" className="mb-4">{errorCarga}</Alert>}

        {/* Datos del estudiante + Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start mb-5">
          {solicitud && (
            <Card>
              <CardHeader title="Datos del estudiante" />
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
          )}

          {documentos.length > 0 && (
            <Card>
              <CardHeader title="Documentos" />
              <div className="grid grid-cols-1 gap-2.5">
                {documentos.map((doc, i) => (
                  <DocumentoTile
                    key={i}
                    nombre={doc.nombre_original ?? doc.nombre ?? '—'}
                    tipoLabel={ETIQUETAS_DOC[doc.tipo] ?? doc.tipo}
                    onVer={() => handleVerPDF(doc)}
                    onDescargar={() => handleDescargar(doc)}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Aún sin llegar al vicerrector: mantener presencia de la IA en vez de una página vacía */}
        {solicitud && !['pendiente_rector', 'aprobada', 'rechazada'].includes(solicitud.estado) && !homologacion && (
          <Card className="mb-5">
            <AIMessage mascot="/img/Iaesperando.svg" size="lg" decorate>
              Esta solicitud todavía está en manos del coordinador. Te avisaré aquí apenas el análisis
              esté listo para tu decisión final.
            </AIMessage>
          </Card>
        )}

        {/* Resumen IA + asignaturas */}
        {homologacion && (
          <Card className="mb-5">
            <CardHeader title="Análisis de homologación" />

            <AIMessage mascot="/img/Iaesperando.svg" size="lg" decorate className="mb-4">
              El coordinador ya revisó el análisis generado y lo dejó listo para tu decisión final.
              Aquí tienes el resumen y el detalle de cada asignatura.
            </AIMessage>

            {asignaturas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <StatTile icon={Layers} value={asignaturas.length} label="Materias analizadas" tone="primary" />
                <StatTile icon={CheckCircle2} value={resumenEstados.homologada ?? 0} label="Equivalencias aprobadas" tone="success" />
                <StatTile icon={Clock3} value={resumenEstados.pendiente ?? 0} label="Pendientes" tone="accent" />
                <StatTile
                  icon={GraduationCap}
                  value={creditosPrograma ? `${creditosHomologados} / ${creditosPrograma}` : creditosHomologados}
                  label="Créditos homologados"
                  tone="success"
                />
              </div>
            )}

            <MateriasResumenChips homologadas={materiasHomologadas} pendientes={materiasPendientes} />

            <ObservationsPanel titulo="Resumen del análisis IA" texto={homologacion.resumen_ia} className="mb-4" />

            {asignaturas.length > 0 && (
              <div className="flex flex-col gap-3">
                {asignaturas.map((a) => (
                  <AsignaturaCard key={a.id} asignatura={a} />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Acciones vicerrector — pendiente_rector: editar asignaturas + aprobar/rechazar */}
        {solicitud?.estado === 'pendiente_rector' && (
          <Card className="mb-5">
            <CardHeader title="Decisión del vicerrector" subtitle="Puedes ajustar el estado de cada asignatura antes de tomar la decisión final." />

            <AIMessage mascot="/img/Iapensando.svg" size="lg" decorate animate="animate-pulse" className="mb-4">
              Ya tienes todo lo necesario para decidir: el análisis de las asignaturas y la resolución oficial.
              Tómate el tiempo que necesites antes de aprobar o rechazar.
            </AIMessage>

            {asignaturas.length > 0 && (
              <>
                <div className="flex flex-col gap-3 mb-3">
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
                <Button variant="secondary" onClick={handleGuardarEdiciones} loading={guardandoEdiciones} className="mb-4">
                  {guardandoEdiciones ? 'Guardando...' : 'Guardar cambios en asignaturas'}
                </Button>
              </>
            )}

            <div className="mb-4">
              <AgregarAsignaturaForm onAgregar={handleAgregarAsignatura} agregando={agregandoAsignatura} />
            </div>

            {/* Resolución */}
            <div className="border-t border-ink-100 py-4">
              <h3 className="text-sm font-medium text-ink-700 mb-1">Resolución oficial</h3>
              <p className="text-xs text-ink-500 mb-3">
                Genera la resolución automática, descárgala, edítala si es necesario y sube la versión final antes de aprobar.
              </p>

              {!resolucionSubida && (
                <div className="flex flex-col items-center text-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/60 px-6 py-8 mb-3">
                  <span className="w-11 h-11 rounded-full bg-white border border-ink-100 flex items-center justify-center text-ink-400">
                    <FileWarning className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-ink-700">Aún no hay una resolución generada</p>
                  <p className="text-xs text-ink-500 max-w-xs">Genera la resolución automática o sube una versión editada para revisarla antes de decidir.</p>
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
                  <Button onClick={handleSubirResolucion} className="self-start">Subir resolución editada</Button>
                )}
                <Button variant="secondary" onClick={handleDescargarResolucion} loading={descargando} className="self-start">
                  {!descargando && <Download className="w-4 h-4" aria-hidden="true" />}
                  {descargando ? 'Generando...' : resolucionSubida ? 'Descargar resolución' : 'Generar y descargar resolución'}
                </Button>
              </div>
            </div>

            {/* Observación y botones de decisión */}
            <div className="border-t border-ink-100 pt-4">
              <Textarea
                label="Observación"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Observación para el estudiante y coordinador (opcional)"
                rows={3}
                className="mb-4"
              />

              {accionando && (
                <AIMessage mascot="/img/Iapensando.svg" size="md" decorate animate="animate-pulse" className="mb-4">
                  Estoy registrando tu decisión, un momento...
                </AIMessage>
              )}

              <div className="flex flex-wrap gap-3">
                <Button variant="success" onClick={() => handleAccion('aprobar')} loading={accionando}>
                  {!accionando && <Check className="w-4 h-4" aria-hidden="true" />}
                  {accionando ? 'Procesando...' : 'Aprobar solicitud'}
                </Button>
                <Button variant="danger" onClick={() => handleAccion('rechazar')} loading={accionando}>
                  {!accionando && <X className="w-4 h-4" aria-hidden="true" />}
                  {accionando ? 'Procesando...' : 'Rechazar solicitud'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Resolución aprobada */}
        {solicitud?.estado === 'aprobada' && (
          <Card className="mb-5 border-success-200">
            <AIMessage mascot="/img/Iaaprobada.svg" size="lg" decorate animate="animate-float" className="mb-4">
              <p className="font-medium text-success-700">¡Homologación aprobada!</p>
              <p className="text-sm text-ink-500 mt-0.5">
                {solicitud.numero_resolucion ? `Resolución N.° ${solicitud.numero_resolucion} — ya está disponible para descarga.` : 'La resolución oficial ya está disponible para descarga.'}
              </p>
            </AIMessage>
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
                <Button onClick={handleSubirResolucion} className="self-start">Subir resolución editada</Button>
              )}
              <Button onClick={handleDescargarResolucion} loading={descargando} className="self-start">
                {!descargando && <Download className="w-4 h-4" aria-hidden="true" />}
                {descargando ? 'Generando...' : resolucionSubida ? 'Descargar resolución' : 'Generar y descargar resolución'}
              </Button>
            </div>
          </Card>
        )}

        {/* Solicitud rechazada */}
        {solicitud?.estado === 'rechazada' && (
          <Card className="mb-5 border-danger-200">
            <AIMessage mascot="/img/Iaerror.svg" size="lg" decorate animate="animate-float">
              <p className="font-medium text-danger-700">Solicitud rechazada</p>
              {solicitud.observaciones && (
                <p className="text-sm text-ink-600 mt-1">{solicitud.observaciones}</p>
              )}
            </AIMessage>
          </Card>
        )}

        {/* Historial */}
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
