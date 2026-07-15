import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import UploadPDF from '../../components/UploadPDF';
import Spinner from '../../components/Spinner';

const ESTADOS_CON_HOMOLOGACION = ['revision_coordinador', 'pendiente_rector', 'aprobada', 'rechazada'];

export default function DetalleSolicitudCoordinador() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [homologacion, setHomologacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
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
      setError('No se pudo cargar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const limpiarMensajes = () => { setError(null); setExito(null); };

  const handleVerPDF = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setVistaPrevia({ url, nombre: doc.nombre_original ?? 'Documento' });
    } catch {
      setError('Error al cargar la vista previa.');
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
      setError('Error al descargar el documento.');
    }
  };

  const handleRevisar = async () => {
    limpiarMensajes();
    try {
      await client.patch(`/solicitudes/${id}/cambiar-estado`, { observacion }, { params: { nuevo_estado: 'en_revision' } });
      setExito('Solicitud tomada en revisión.');
      setObservacion('');
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al tomar en revisión.');
    }
  };

  const handleSubirPensum = async () => {
    if (!archivoPensum) return;
    setSubiendo(true);
    limpiarMensajes();
    try {
      const formData = new FormData();
      formData.append('file', archivoPensum);
      await client.post(`/documentos/${id}/pensum-destino`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExito('Pensum subido correctamente.');
      setArchivoPensum(null);
      await cargarDocumentos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al subir el pensum.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleSubirResolucion = async () => {
    if (!archivoResolucion) return;
    setSubiendoResolucion(true);
    limpiarMensajes();
    try {
      const formData = new FormData();
      formData.append('file', archivoResolucion);
      await client.post(`/documentos/${id}/resolucion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExito('Resolución subida. Al generar se usará este archivo en lugar del automático.');
      setArchivoResolucion(null);
      await cargarDocumentos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al subir la resolución.');
    } finally {
      setSubiendoResolucion(false);
    }
  };

  const handleProcesarIA = async () => {
    setProcesando(true);
    limpiarMensajes();
    try {
      await client.post(`/homologaciones/${id}/procesar`);
      setExito('Análisis completado. Revisa los resultados y ajústalos antes de enviar al rector.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al procesar con IA.');
    } finally {
      setProcesando(false);
    }
  };

  const handleGuardarEdiciones = async () => {
    setGuardandoEdiciones(true);
    limpiarMensajes();
    try {
      await Promise.all(
        (homologacion?.asignaturas ?? []).map((a) =>
          client.patch(`/homologaciones/${id}/asignaturas/${a.id}`, {
            estado: ediciones[a.id]?.estado ?? a.estado,
            justificacion: ediciones[a.id]?.justificacion || null,
          })
        )
      );
      setExito('Cambios guardados.');
      await cargarHomologacion();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar los cambios.');
    } finally {
      setGuardandoEdiciones(false);
    }
  };

  const handleDescargarResolucion = async () => {
    setDescargandoResolucion(true);
    limpiarMensajes();
    try {
      const { data } = await client.post(`/homologaciones/${id}/generar-resolucion`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resolucion_${id}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar la resolución.');
    } finally {
      setDescargandoResolucion(false);
    }
  };

  const handleEnviarRector = async () => {
    setEnviandoRector(true);
    limpiarMensajes();
    try {
      await client.post(`/homologaciones/${id}/enviar-rector`);
      setExito('Solicitud enviada al rector para aprobación final.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar al rector.');
    } finally {
      setEnviandoRector(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-gray-50"><Navbar /><Spinner /></div>;

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error || 'No se encontró la solicitud.'}
          </div>
          <button onClick={() => navigate('/coordinador/solicitudes')} className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900">
            Volver
          </button>
        </main>
      </div>
    );
  }

  const tieneNotas = documentos.some((d) => (d?.tipo || '').toLowerCase() === 'pensum_origen');
  const tienePensum = documentos.some((d) => (d?.tipo || '').toLowerCase() === 'pensum_destino');
  const resolucionSubida = documentos.find((d) => (d?.tipo || '').toLowerCase() === 'resolucion');
  const asignaturas = homologacion?.asignaturas ?? [];
  const mostrarResolucion = ESTADOS_CON_HOMOLOGACION.filter((e) => e !== 'rechazada').includes(solicitud.estado);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Modal vista previa PDF */}
      {vistaPrevia && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
          <div className="flex items-center justify-between bg-[#1F3864] px-4 py-3">
            <span className="text-white text-sm font-medium truncate">{vistaPrevia.nombre}</span>
            <button onClick={cerrarVistaPrevia} className="text-white hover:text-blue-200 text-sm px-3 py-1 border border-white/30 rounded">
              Cerrar
            </button>
          </div>
          <iframe src={vistaPrevia.url} className="flex-1 w-full" title={vistaPrevia.nombre} />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/coordinador/solicitudes')} className="text-gray-400 hover:text-gray-600 text-sm">
            {'<-'} Volver
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Detalle de solicitud</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}
        {exito && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{exito}</div>
        )}

        {/* Info del estudiante */}
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">Información del estudiante</h2>
            <EstadoBadge estado={solicitud.estado} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Cédula', solicitud.cedula ?? '—'],
              ['Correo', solicitud.correo_contacto ?? '—'],
              ['Teléfono', solicitud.telefono ?? '—'],
              ['Institución origen', solicitud.institucion_origen ?? '—'],
              ['Programa origen', solicitud.programa_origen ?? '—'],
              ['Institución destino', solicitud.institucion_destino ?? '—'],
              ['Programa destino', solicitud.programa_destino ?? '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="text-gray-700 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
          <h2 className="font-medium text-gray-800 mb-4">Documentos</h2>
          {!documentos.length ? (
            <p className="text-sm text-gray-400">No hay documentos subidos aún.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {documentos.map((doc, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="truncate mr-3">
                    <span className="text-gray-700 font-medium">{doc.nombre_original ?? doc.nombre ?? '—'}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                      {doc.tipo === 'pensum_origen' ? 'Notas del estudiante'
                        : doc.tipo === 'pensum_destino' ? 'Pensum destino'
                        : doc.tipo === 'resolucion' ? 'Resolución'
                        : doc.tipo}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    {doc.tipo !== 'resolucion' && (
                      <button onClick={() => handleVerPDF(doc)} className="text-blue-700 hover:underline text-sm">
                        Ver
                      </button>
                    )}
                    <button onClick={() => handleDescargar(doc)} className="text-gray-500 hover:underline text-sm">
                      Descargar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ─── ENVIADA: tomar en revisión ─── */}
        {solicitud.estado === 'enviada' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-2">Tomar en revisión</h2>
            <p className="text-sm text-gray-500 mb-4">
              Al tomar en revisión podrás subir el pensum del programa destino y activar el análisis con IA.
            </p>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Observación (opcional)"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <button onClick={handleRevisar} className="px-5 py-2 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600">
              Tomar en revisión
            </button>
          </div>
        )}

        {/* ─── EN_REVISION: subir pensum + procesar ─── */}
        {solicitud.estado === 'en_revision' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-4">Preparar análisis IA</h2>

            {!tieneNotas && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded">
                El estudiante aún no ha subido su certificado de notas. Espera a que lo suba antes de procesar.
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {tienePensum ? '✓ Pensum destino subido' : 'Paso 1 — Subir pensum del programa destino'}
                </p>
                {!tienePensum && (
                  <>
                    <UploadPDF label="Seleccionar pensum destino (PDF)" onFile={setArchivoPensum} />
                    {archivoPensum && (
                      <button onClick={handleSubirPensum} disabled={subiendo} className="mt-2 px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50">
                        {subiendo ? 'Subiendo...' : 'Subir pensum'}
                      </button>
                    )}
                  </>
                )}
              </div>

              {tienePensum && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Paso 2 — Activar análisis con IA</p>
                  <p className="text-xs text-gray-500 mb-3">El sistema analizará las notas del estudiante y el pensum destino. Puede tardar hasta 1 minuto.</p>
                  <button
                    onClick={handleProcesarIA}
                    disabled={procesando || !tieneNotas}
                    className="px-5 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {procesando && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {procesando ? 'Procesando (puede tardar 1 min)...' : 'Activar análisis IA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PROCESANDO_IA ─── */}
        {solicitud.estado === 'procesando_ia' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <div className="flex items-center gap-4">
              <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Analizando con IA...</p>
                <p className="text-xs text-gray-500 mt-0.5">Puede tardar hasta 1 minuto. Recarga la página para ver si ha terminado.</p>
              </div>
              <button onClick={cargar} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:bg-gray-50">
                Recargar
              </button>
            </div>
          </div>
        )}

        {/* ─── REVISION_COORDINADOR: revisar y editar ─── */}
        {solicitud.estado === 'revision_coordinador' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-gray-800">Resultado del análisis IA</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Revisión del coordinador</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Revisa cada asignatura, ajusta el estado y la justificación si es necesario, y luego envía al rector.
            </p>

            {homologacion?.resumen_ia && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded text-sm text-gray-700">
                <p className="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide">Resumen IA</p>
                <p>{homologacion.resumen_ia}</p>
              </div>
            )}

            <details className="mb-4 border border-gray-200 rounded-md">
              <summary className="px-4 py-3 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 rounded-md select-none">
                Volver a procesar con otro pensum destino
              </summary>
              <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
                  Atención: al reprocesar se eliminarán los resultados actuales.
                </p>
                <UploadPDF label="Seleccionar nuevo pensum (PDF)" onFile={setArchivoPensum} />
                {archivoPensum && (
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={handleSubirPensum} disabled={subiendo} className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50">
                      {subiendo ? 'Subiendo...' : 'Subir pensum'}
                    </button>
                    {tienePensum && (
                      <button onClick={handleProcesarIA} disabled={procesando} className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                        {procesando && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {procesando ? 'Procesando...' : 'Reprocesar con IA'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </details>

            {asignaturas.length > 0 ? (
              <div className="overflow-x-auto rounded border border-gray-200 mb-4">
                <table className="min-w-full text-xs divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Asignatura origen</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase">Créd.</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase">Nota</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Asignatura destino</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase">Sem.</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-500 uppercase">Sim. %</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Justificación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {asignaturas.map((a) => {
                      const ed = ediciones[a.id] ?? { estado: a.estado, justificacion: a.justificacion ?? '' };
                      return (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-800">{a.asignatura_origen}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{a.creditos_origen ?? '—'}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{a.calificacion_origen ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{a.asignatura_destino ?? '—'}</td>
                          <td className="px-3 py-2 text-center text-gray-600">{a.semestre_destino ?? '—'}</td>
                          <td className="px-3 py-2 text-center text-gray-600">
                            {a.similitud_porcentaje != null ? `${a.similitud_porcentaje}%` : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={ed.estado}
                              onChange={(e) => setEdiciones((prev) => ({ ...prev, [a.id]: { ...ed, estado: e.target.value } }))}
                              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            >
                              <option value="aprobada">Aprobada</option>
                              <option value="rechazada">Rechazada</option>
                              <option value="pendiente">Pendiente</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={ed.justificacion}
                              onChange={(e) => setEdiciones((prev) => ({ ...prev, [a.id]: { ...ed, justificacion: e.target.value } }))}
                              placeholder="Escribe una justificación..."
                              className="w-full min-w-[200px] border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No hay asignaturas en el análisis.</p>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={handleGuardarEdiciones}
                disabled={guardandoEdiciones}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {guardandoEdiciones ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                onClick={handleEnviarRector}
                disabled={enviandoRector}
                className="px-5 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
              >
                {enviandoRector ? 'Enviando...' : 'Enviar al rector'}
              </button>
              <p className="text-xs text-gray-400 ml-auto">Una vez enviado al rector no podrás modificar los resultados.</p>
            </div>
          </div>
        )}

        {/* ─── APROBADA ─── */}
        {solicitud.estado === 'aprobada' && (
          <div className="bg-white rounded-lg border border-green-200 px-6 py-5 mb-4">
            <p className="font-medium text-green-800 mb-0.5">Solicitud aprobada por el rector</p>
            <p className="text-xs text-gray-500">La resolución oficial está disponible para descarga.</p>
          </div>
        )}

        {/* ─── Solo lectura (pendiente_rector / aprobada / rechazada) ─── */}
        {ESTADOS_CON_HOMOLOGACION.filter((e) => e !== 'revision_coordinador').includes(solicitud.estado) && homologacion && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-4">Resultado del análisis</h2>

            {homologacion.resumen_ia && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded text-sm text-gray-700">
                <p className="text-xs font-medium text-blue-700 mb-1 uppercase tracking-wide">Resumen IA</p>
                <p>{homologacion.resumen_ia}</p>
              </div>
            )}

            {asignaturas.length > 0 && (
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-xs divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Asignatura origen', 'Créd.', 'Nota', 'Asignatura destino', 'Sem.', 'Créd. dest.', 'Sim. %', 'Estado', 'Justificación'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {asignaturas.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-800">{a.asignatura_origen}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{a.creditos_origen ?? '—'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{a.calificacion_origen ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-700">{a.asignatura_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{a.semestre_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">{a.creditos_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center text-gray-600">
                          {a.similitud_porcentaje != null ? `${a.similitud_porcentaje}%` : '—'}
                        </td>
                        <td className="px-3 py-2"><EstadoBadge estado={a.estado} /></td>
                        <td className="px-3 py-2 max-w-xs text-gray-600">{a.justificacion ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── Resolución ─── */}
        {mostrarResolucion && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-1">Resolución oficial</h2>
            <p className="text-sm text-gray-500 mb-4">
              Genera la resolución automática, descárgala, edítala en Word si es necesario, y sube la versión final.
            </p>

            {resolucionSubida && (
              <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="text-green-700 font-medium flex-1 truncate">✓ {resolucionSubida.nombre_original}</span>
                <button onClick={() => handleDescargar(resolucionSubida)} className="text-blue-700 hover:underline text-xs flex-shrink-0">
                  Descargar
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {resolucionSubida ? 'Reemplazar resolución (DOCX o PDF)' : 'Subir resolución editada (DOCX o PDF)'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setArchivoResolucion(e.target.files[0] ?? null)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:text-gray-700 file:bg-white hover:file:bg-gray-50 cursor-pointer"
                />
              </div>
              {archivoResolucion && (
                <button
                  onClick={handleSubirResolucion}
                  disabled={subiendoResolucion}
                  className="self-start px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
                >
                  {subiendoResolucion ? 'Subiendo...' : 'Subir resolución'}
                </button>
              )}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={handleDescargarResolucion}
                  disabled={descargandoResolucion}
                  className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
                >
                  {descargandoResolucion ? 'Generando...' : resolucionSubida ? '⬇ Descargar resolución' : '⬇ Generar y descargar resolución'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── HISTORIAL ─── */}
        {historial.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-4">Historial de estados</h2>
            <ol className="relative border-l border-gray-200 ml-2">
              {historial.map((h, i) => (
                <li key={i} className="mb-4 ml-4">
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-1.5 mt-1" />
                  <p className="text-xs text-gray-400">
                    {new Date(h.creado_en).toLocaleString('es-CO')}
                    {h.usuario_nombre && <span className="ml-2 text-gray-500">· {h.usuario_nombre}</span>}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2 flex-wrap mt-0.5">
                    <EstadoBadge estado={h.estado_anterior} />
                    <span className="text-gray-400">→</span>
                    <EstadoBadge estado={h.estado_nuevo} />
                  </p>
                  {h.observacion && (
                    <p className="text-xs text-gray-500 mt-1 pl-1 border-l-2 border-gray-200">{h.observacion}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

      </main>
    </div>
  );
}
