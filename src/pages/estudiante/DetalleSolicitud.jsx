import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import EstadoBadge from '../../components/EstadoBadge';
import UploadPDF from '../../components/UploadPDF';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

export default function DetalleSolicitud() {
  const { id } = useParams();
  const { nombre: nombreAuth } = useAuth();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [documentosState, setDocumentosState] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [descargandoResolucion, setDescargandoResolucion] = useState(false);
  const [eliminando, setEliminando] = useState(new Set());

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

  const cargar = async () => {
    try {
      const { data: sol } = await client.get(`/solicitudes/${id}`);
      setSolicitud(sol);
    } catch (err) {
      console.warn('Error al cargar solicitud:', err);
      setError('No se pudo cargar la solicitud.');
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
    setError(null);
    console.log('📤 Iniciando carga de notas...');
    console.log('Archivo:', archivoPDF.name, archivoPDF.type, archivoPDF.size);
    try {
      const formData = new FormData();
      formData.append('file', archivoPDF);
      
      console.log('📤 POST a /documentos/%s/notas', id);
      const response = await client.post(`/documentos/${id}/notas`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('✅ Respuesta:', response.data);
      setExito('Notas subidas correctamente.');
      setArchivoPDF(null);
      cargar();
    } catch (err) {
      console.error('❌ Error al subir:', err);
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      const detail = err.response?.data?.detail || err.message || 'Error al subir el archivo.';
      setError(detail);
    } finally {
      setSubiendo(false);
    }
  };

  const handleDescargarResolucion = async () => {
    setDescargandoResolucion(true);
    setError(null);
    try {
      const { data } = await client.post(`/homologaciones/${id}/generar-resolucion`, {}, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resolucion_homologacion.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar la resolución.');
    } finally {
      setDescargandoResolucion(false);
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
      setError('Error al descargar el documento.');
    }
  };

  const handleEliminar = async (doc) => {
    setEliminando((prev) => new Set([...prev, doc.id]));
    setError(null);
    try {
      await client.delete(`/documentos/${id}/${doc.id}`);
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar el documento.');
    } finally {
      setEliminando((prev) => { const n = new Set(prev); n.delete(doc.id); return n; });
    }
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setError(null);
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
      setExito('Solicitud enviada correctamente.');
      cargar();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <div className="min-h-screen bg-gray-50"><Navbar /><Spinner /></div>;

  if (!solicitud) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error || 'No se encontró la solicitud.'}
          </div>
          <button
            onClick={() => navigate('/solicitudes')}
            className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900"
          >
            Volver a solicitudes
          </button>
        </main>
      </div>
    );
  }

  const val = (v) => v ?? 'No especificado';
  const documentos = solicitud?.documentos ?? documentosState;
  const puedeSubirDocs = ['borrador', 'enviada', 'en_revision'].includes(solicitud?.estado);
  const tieneNotas = documentos.some?.((d) => {
    const tipo = String(d.tipo ?? '').toLowerCase();
    return tipo === 'pensum_origen';
  }) ?? false;
  const nombreEstudiante = solicitud.estudiante?.nombre
    || solicitud.nombre
    || solicitud.estudiante_nombre
    || solicitud.nombre_estudiante
    || solicitud.estudiante?.name
    || solicitud.name
    || nombreAuth;

  // Debug: log para ver qué está llegando
  console.log('Estado:', solicitud.estado);
  console.log('Documentos:', documentos);
  console.log('Nombre estudiante:', nombreEstudiante);
  console.log('Tiene notas:', tieneNotas);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/solicitudes')} className="text-gray-400 hover:text-gray-600 text-sm">
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

        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">Información de la solicitud</h2>
            <EstadoBadge estado={solicitud.estado} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Nombre', val(nombreEstudiante)],
              ['Cédula', val(solicitud.cedula)],
              ['Teléfono', val(solicitud.telefono)],
              ['Correo de contacto', val(solicitud.correo_contacto)],
              ['Institución origen', val(solicitud.institucion_origen)],
              ['Programa origen', val(solicitud.programa_origen)],
              ['Institución destino', val(solicitud.institucion_destino)],
              ['Programa destino', val(solicitud.programa_destino)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="text-gray-700 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">Documentos</h2>
            {puedeSubirDocs && (
              <span className="text-xs text-gray-400">{documentos.filter(d => d.tipo?.toLowerCase() === 'pensum_origen').length}/4 archivos</span>
            )}
          </div>

          {documentos.length > 0 && (
            <div className="space-y-2 mb-4">
              {documentos.map((doc, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                  <span className="text-gray-700 truncate mr-3">{doc.nombre_original ?? doc.nombre ?? 'Documento'}</span>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => handleDescargar(doc)} className="text-blue-700 hover:underline">
                      Descargar
                    </button>
                    {puedeSubirDocs && (
                      <button
                        onClick={() => handleEliminar(doc)}
                        disabled={eliminando.has(doc.id)}
                        className="text-red-500 hover:underline disabled:opacity-40"
                      >
                        {eliminando.has(doc.id) ? '...' : 'Quitar'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {puedeSubirDocs ? (
            documentos.filter(d => d.tipo?.toLowerCase() === 'pensum_origen').length < 4 ? (
              <div className="flex flex-col gap-3">
                {!documentos.length && (
                  <p className="text-sm text-gray-500">Aún no has subido tus notas académicas.</p>
                )}
                <UploadPDF label="Agregar notas académicas (PDF)" onFile={setArchivoPDF} />
                {archivoPDF && (
                  <button
                    onClick={handleSubirNotas}
                    disabled={subiendo}
                    className="self-start px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
                  >
                    {subiendo ? 'Subiendo...' : 'Subir'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Límite de 4 archivos alcanzado. Quita uno para subir otro.</p>
            )
          ) : (
            !documentos.length && <p className="text-sm text-gray-400">Sin documentos.</p>
          )}
        </div>

        {solicitud.estado === 'borrador' && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-6 mb-4">
            <h2 className="font-medium text-gray-800 mb-2">Enviar solicitud</h2>
            <p className="text-sm text-gray-500 mb-4">
              Una vez enviada, no podrás modificar la solicitud.
            </p>
            {!tieneNotas && (
              <p className="text-sm text-amber-600 mb-3">
                Debes subir tu certificado de notas antes de enviar la solicitud.
              </p>
            )}
            <button
              onClick={handleEnviar}
              disabled={enviando || !tieneNotas}
              className="px-5 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        )}

        {solicitud.estado === 'aprobada' && (
          <div className="bg-white rounded-lg border border-green-200 px-6 py-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Tu homologación fue aprobada</p>
                <p className="text-xs text-gray-500 mt-0.5">Descarga la resolución oficial de homologación.</p>
              </div>
              <button
                onClick={handleDescargarResolucion}
                disabled={descargandoResolucion}
                className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50 whitespace-nowrap"
              >
                {descargandoResolucion ? 'Generando...' : '⬇ Descargar resolución'}
              </button>
            </div>
          </div>
        )}

        {solicitud.estado === 'rechazada' && (
          <div className="bg-white rounded-lg border border-red-200 px-6 py-5 mb-4">
            <p className="font-medium text-red-800">Tu solicitud fue rechazada</p>
            {solicitud.observaciones && (
              <p className="text-sm text-gray-600 mt-1">{solicitud.observaciones}</p>
            )}
          </div>
        )}

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
                    <span>{'→'}</span>
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