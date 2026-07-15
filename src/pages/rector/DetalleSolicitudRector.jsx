import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import Spinner from '../../components/Spinner';

export default function DetalleSolicitudRector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [homologacion, setHomologacion] = useState(null);
  const [ediciones, setEdiciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [accionando, setAccionando] = useState(false);
  const [guardandoEdiciones, setGuardandoEdiciones] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [archivoResolucion, setArchivoResolucion] = useState(null);
  const [subiendoResolucion, setSuiendoResolucion] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null); // { url, nombre }

  const cargar = async () => {
    setCargando(true);
    try {
      const { data: sol } = await client.get(`/solicitudes/${id}`);
      setSolicitud(sol);

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
      setError('No se pudo cargar la solicitud.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [id]);

  const limpiarMensajes = () => { setError(null); setExito(null); };

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
      setError('Error al descargar el documento.');
    }
  };

  const handleVerPDF = async (doc) => {
    try {
      const { data } = await client.get(`/documentos/${id}/${doc.id}/descargar`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setVistaPrevia({ url, nombre: doc.nombre_original ?? 'Documento' });
    } catch {
      setError('Error al cargar la vista previa del documento.');
    }
  };

  const cerrarVistaPrevia = () => {
    if (vistaPrevia?.url) URL.revokeObjectURL(vistaPrevia.url);
    setVistaPrevia(null);
  };

  const handleSubirResolucion = async () => {
    if (!archivoResolucion) return;
    setSuiendoResolucion(true);
    limpiarMensajes();
    try {
      const formData = new FormData();
      formData.append('file', archivoResolucion);
      await client.post(`/documentos/${id}/resolucion`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExito('Resolución subida. Al generar se usará este archivo.');
      setArchivoResolucion(null);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al subir la resolución.');
    } finally {
      setSuiendoResolucion(false);
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
      setExito('Cambios en asignaturas guardados.');
      await cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar los cambios.');
    } finally {
      setGuardandoEdiciones(false);
    }
  };

  const handleAccion = async (accion) => {
    setAccionando(true);
    limpiarMensajes();
    try {
      await client.post(`/solicitudes/${id}/${accion}`, { observacion });
      setExito(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} correctamente.`);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.detail || `Error al ${accion} la solicitud.`);
    } finally {
      setAccionando(false);
    }
  };

  const handleDescargarResolucion = async () => {
    setDescargando(true);
    limpiarMensajes();
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
      setError('Error al descargar la resolución.');
    } finally {
      setDescargando(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-gray-50"><Navbar /><Spinner /></div>;

  const asignaturas = homologacion?.asignaturas ?? [];
  const resolucionSubida = documentos.find((d) => (d?.tipo || '').toLowerCase() === 'resolucion');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Modal vista previa PDF */}
      {vistaPrevia && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
          <div className="flex items-center justify-between bg-[#1F3864] px-4 py-3">
            <span className="text-white text-sm font-medium truncate">{vistaPrevia.nombre}</span>
            <button
              onClick={cerrarVistaPrevia}
              className="text-white hover:text-blue-200 text-sm px-3 py-1 border border-white/30 rounded"
            >
              Cerrar
            </button>
          </div>
          <iframe
            src={vistaPrevia.url}
            className="flex-1 w-full"
            title={vistaPrevia.nombre}
          />
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/rector/solicitudes')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Volver
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Detalle de solicitud</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}
        {exito && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{exito}</div>
        )}

        {/* Datos del estudiante */}
        {solicitud && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-800">Datos del estudiante</h2>
              <EstadoBadge estado={solicitud.estado} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ['Nombre', solicitud.estudiante?.nombre ?? '—'],
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
        )}

        {/* Documentos */}
        {documentos.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-4">Documentos</h2>
            <ul className="flex flex-col gap-2">
              {documentos.map((doc, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-700 font-medium">{doc.nombre_original ?? doc.nombre ?? '—'}</span>
                    <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {doc.tipo === 'pensum_origen' ? 'Notas del estudiante' : doc.tipo === 'pensum_destino' ? 'Pensum destino' : doc.tipo}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleVerPDF(doc)} className="text-blue-700 hover:underline text-sm">
                      Ver
                    </button>
                    <button onClick={() => handleDescargar(doc)} className="text-gray-500 hover:underline text-sm">
                      Descargar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resumen IA + tabla de homologaciones */}
        {homologacion && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-4">Análisis de homologación</h2>

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
                      {['Asignatura origen', 'Nota', 'Asignatura destino', 'Créd.', 'Sem.', 'Tipo', 'Sim. %', 'Estado', 'Justificación'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {asignaturas.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-800">{a.asignatura_origen}</td>
                        <td className="px-3 py-2 text-center">{a.calificacion_origen ?? '—'}</td>
                        <td className="px-3 py-2">{a.asignatura_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{a.creditos_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{a.semestre_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{a.tipo_destino ?? '—'}</td>
                        <td className="px-3 py-2 text-center">{a.similitud_porcentaje != null ? `${a.similitud_porcentaje}%` : '—'}</td>
                        <td className="px-3 py-2"><EstadoBadge estado={a.estado} /></td>
                        <td className="px-3 py-2 max-w-xs text-gray-600" title={a.justificacion}>
                          <span className="block truncate">{a.justificacion ?? '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Acciones rector — pendiente_rector: editar asignaturas + aprobar/rechazar */}
        {solicitud?.estado === 'pendiente_rector' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-1">Decisión del rector</h2>
            <p className="text-sm text-gray-500 mb-4">
              Puedes ajustar el estado de cada asignatura antes de tomar la decisión final.
            </p>

            {/* Tabla editable */}
            {asignaturas.length > 0 && (
              <>
                <div className="overflow-x-auto rounded border border-gray-200 mb-3">
                  <table className="min-w-full text-xs divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Asignatura origen</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Asignatura destino</th>
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
                            <td className="px-3 py-2 text-gray-700">{a.asignatura_destino ?? '—'}</td>
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
                                placeholder="Justificación (opcional)"
                                className="w-full min-w-[180px] border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleGuardarEdiciones}
                  disabled={guardandoEdiciones}
                  className="mb-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {guardandoEdiciones ? 'Guardando...' : 'Guardar cambios en asignaturas'}
                </button>
              </>
            )}

            {/* Resolución */}
            <div className="border-t border-gray-100 py-4">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Resolución oficial</h3>
              <p className="text-xs text-gray-500 mb-3">
                Genera la resolución automática, descárgala, edítala si es necesario y sube la versión final antes de aprobar.
              </p>
              {resolucionSubida && (
                <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm">
                  <span className="text-green-700 font-medium flex-1 truncate">✓ {resolucionSubida.nombre_original}</span>
                  <button onClick={() => handleDescargar(resolucionSubida)} className="text-blue-700 hover:underline text-xs flex-shrink-0">Descargar</button>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setArchivoResolucion(e.target.files[0] ?? null)}
                  className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:text-gray-700 file:bg-white hover:file:bg-gray-50 cursor-pointer"
                />
                {archivoResolucion && (
                  <button
                    onClick={handleSubirResolucion}
                    disabled={subiendoResolucion}
                    className="self-start px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
                  >
                    {subiendoResolucion ? 'Subiendo...' : 'Subir resolución editada'}
                  </button>
                )}
                <button
                  onClick={handleDescargarResolucion}
                  disabled={descargando}
                  className="self-start px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  {descargando ? 'Generando...' : resolucionSubida ? '⬇ Descargar resolución' : '⬇ Generar y descargar resolución'}
                </button>
              </div>
            </div>

            {/* Observación y botones de decisión */}
            <div className="border-t border-gray-100 pt-4">
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Observación para el estudiante y coordinador (opcional)"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleAccion('aprobar')}
                  disabled={accionando}
                  className="px-5 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {accionando ? 'Procesando...' : '✓ Aprobar solicitud'}
                </button>
                <button
                  onClick={() => handleAccion('rechazar')}
                  disabled={accionando}
                  className="px-5 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {accionando ? 'Procesando...' : '✕ Rechazar solicitud'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resolución aprobada */}
        {solicitud?.estado === 'aprobada' && (
          <div className="bg-white rounded-lg border border-green-200 px-6 py-6 mb-4">
            <p className="font-medium text-green-800 mb-3">Solicitud aprobada</p>
            {resolucionSubida && (
              <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="text-green-700 font-medium flex-1 truncate">✓ {resolucionSubida.nombre_original}</span>
                <button onClick={() => handleDescargar(resolucionSubida)} className="text-blue-700 hover:underline text-xs flex-shrink-0">Descargar</button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setArchivoResolucion(e.target.files[0] ?? null)}
                className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:text-gray-700 file:bg-white hover:file:bg-gray-50 cursor-pointer"
              />
              {archivoResolucion && (
                <button
                  onClick={handleSubirResolucion}
                  disabled={subiendoResolucion}
                  className="self-start px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
                >
                  {subiendoResolucion ? 'Subiendo...' : 'Subir resolución editada'}
                </button>
              )}
              <button
                onClick={handleDescargarResolucion}
                disabled={descargando}
                className="self-start px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
              >
                {descargando ? 'Generando...' : resolucionSubida ? '⬇ Descargar resolución' : '⬇ Generar y descargar resolución'}
              </button>
            </div>
          </div>
        )}

        {/* Solicitud rechazada */}
        {solicitud?.estado === 'rechazada' && (
          <div className="bg-white rounded-lg border border-red-200 px-6 py-5 mb-4">
            <p className="font-medium text-red-800">Solicitud rechazada</p>
            {solicitud.observaciones && (
              <p className="text-sm text-gray-600 mt-1">{solicitud.observaciones}</p>
            )}
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6">
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
