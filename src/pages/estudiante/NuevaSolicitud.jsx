import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import UploadPDF from '../../components/UploadPDF';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import Stepper from '../../components/ui/Stepper';
import { Input, Select } from '../../components/ui/Field';

const DESTINO_AUTONOMA = 'Corporación Universitaria Autónoma del Cauca';
const INSTITUCIONES_FALLBACK = [
  'Universidad del Valle',
  'Universidad Nacional',
  'Universidad del Cauca',
  'Universidad del Rosario',
  'Otro',
];
const PROGRAMAS_FALLBACK = [
  'Ingeniería de Sistemas',
  'Administración de Empresas',
  'Derecho',
  'Contaduría Pública',
  'Otro',
];

const PASOS = ['Datos personales', 'Institución de origen', 'Institución de destino', 'Documentos', 'Revisión', 'Confirmación'];
const MAX_DOCUMENTOS = 4;

export default function NuevaSolicitud() {
  const navigate = useNavigate();
  const { showError } = useFeedback();
  const [paso, setPaso] = useState(0);
  const tituloPasoRef = useRef(null);

  useEffect(() => {
    tituloPasoRef.current?.focus();
  }, [paso]);

  const [form, setForm] = useState({
    cedula: '',
    telefono: '',
    correo_contacto: '',
    institucion_origen: '',
    programa_origen: '',
    institucion_destino: '',
    programa_destino: '',
    institucion_origen_id: '',
    programa_origen_id: '',
    institucion_destino_id: '',
    programa_destino_id: '',
  });
  const [instituciones, setInstituciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [selectedInstitucionOrigenId, setSelectedInstitucionOrigenId] = useState(null);
  const [selectedInstitucionDestinoId, setSelectedInstitucionDestinoId] = useState(null);
  const [mostrarOtroOrigen, setMostrarOtroOrigen] = useState(false);
  const [mostrarOtroProgramaOrigen, setMostrarOtroProgramaOrigen] = useState(false);
  const [mostrarOtroProgramaDestino, setMostrarOtroProgramaDestino] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);
  const [cargandoProgramas, setCargandoProgramas] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);

  const [notasBuffer, setNotasBuffer] = useState([]);
  const [progresoActual, setProgresoActual] = useState(null); // { index, total, pct }
  const [pasoConfirmado, setPasoConfirmado] = useState(false);
  const [solicitudCreadaId, setSolicitudCreadaId] = useState(null);
  const [erroresSubida, setErroresSubida] = useState([]);
  const [envioExitoso, setEnvioExitoso] = useState(false);

  const getInstitucionLabel = (item) => {
    if (typeof item === 'string') return item;
    return item.nombre ?? item.name ?? item.institucion ?? '';
  };

  const getProgramaLabel = (item) => {
    if (typeof item === 'string') return item;
    return item.nombre ?? item.name ?? item.programa ?? '';
  };

  const getProgramaId = (item) => {
    if (typeof item === 'string') return item;
    return item.id ?? item._id ?? item.codigo_snies ?? getProgramaLabel(item);
  };

  const getInstitucionId = (item) => {
    if (typeof item === 'string') return item;
    return item.id ?? item._id ?? item.value ?? getInstitucionLabel(item);
  };

  const getProgramaInstitucionInfo = (programa) => {
    if (!programa || typeof programa === 'string') return { id: null, label: null };
    const institucion = programa.institucion_id ?? programa.institucion;
    if (!institucion) return { id: null, label: null };
    if (typeof institucion === 'string') {
      return { id: institucion, label: institucion };
    }
    const label = getInstitucionLabel(institucion);
    const id = institucion.id ?? institucion._id ?? institucion.value ?? institucion.codigo_ies ?? label;
    return { id, label };
  };

  const filterProgramsByInstitucion = (lista, institucionId, institucionLabel) => lista.filter((programa) => {
    const { id: programaInstitucionId, label: programaInstitucionLabel } = getProgramaInstitucionInfo(programa);
    return (
      String(programaInstitucionId) === String(institucionId)
      || String(programaInstitucionLabel) === String(institucionLabel)
    );
  });

  const programasOrigen = form.institucion_origen && !mostrarOtroOrigen && selectedInstitucionOrigenId
    ? filterProgramsByInstitucion(programas, selectedInstitucionOrigenId, form.institucion_origen)
    : programas;

  const programasDestino = selectedInstitucionDestinoId
    ? filterProgramsByInstitucion(programas, selectedInstitucionDestinoId, form.institucion_destino)
    : programas;

  const programaOrigenDisabled = !form.institucion_origen || mostrarOtroOrigen || !selectedInstitucionOrigenId;
  const programaDestinoDisabled = !selectedInstitucionDestinoId;

  useEffect(() => {
    const cargarInstituciones = async () => {
      try {
        const { data } = await client.get('/solicitudes/opciones/instituciones');
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        const opcionesConDestino = lista.some(
          (item) => getInstitucionLabel(item) === DESTINO_AUTONOMA,
        )
          ? lista
          : [...lista, { id: DESTINO_AUTONOMA, nombre: DESTINO_AUTONOMA }];
        setInstituciones(opcionesConDestino);
      } catch (err) {
        console.warn('No se pudieron cargar instituciones:', err);
        const fallback = [
          ...INSTITUCIONES_FALLBACK.map((nombre) => ({ id: nombre, nombre })),
          { id: DESTINO_AUTONOMA, nombre: DESTINO_AUTONOMA },
        ];
        setInstituciones(fallback);
      } finally {
        setCargandoInstituciones(false);
      }
    };

    const cargarProgramas = async () => {
      try {
        const { data } = await client.get('/solicitudes/opciones/programas');
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
          ? data.items
          : [];
        setProgramas(lista);
      } catch (err) {
        console.warn('No se pudieron cargar programas:', err);
        setProgramas(
          PROGRAMAS_FALLBACK.map((nombre) => ({ id: nombre, nombre, institucion_id: null })),
        );
      } finally {
        setCargandoProgramas(false);
      }
    };

    const verificarSolicitudActiva = async () => {
      try {
        const { data } = await client.get('/solicitudes/');
        const lista = data.items ?? data;
        const tieneActiva = Array.isArray(lista) && lista.some((s) => s.estado !== 'rechazada');
        if (tieneActiva) setBloqueado(true);
      } catch {
        // Si falla la verificación, dejar pasar
      }
    };

    cargarInstituciones();
    cargarProgramas();
    verificarSolicitudActiva();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrigenChange = (e) => {
    const value = e.target.value;
    if (value === 'Otro') {
      setMostrarOtroOrigen(true);
      setForm({
        ...form,
        institucion_origen: '',
        programa_origen: '',
        institucion_origen_id: '',
        programa_origen_id: '',
      });
      setSelectedInstitucionOrigenId(null);
    } else {
      const seleccionada = instituciones.find((inst) => getInstitucionId(inst) === value);
      setMostrarOtroOrigen(false);
      setSelectedInstitucionOrigenId(seleccionada ? getInstitucionId(seleccionada) : null);
      setForm({
        ...form,
        institucion_origen: seleccionada ? getInstitucionLabel(seleccionada) : '',
        institucion_origen_id: seleccionada ? getInstitucionId(seleccionada) : '',
        programa_origen: '',
        programa_origen_id: '',
      });
    }
  };

  const handleProgramaOrigenChange = (e) => {
    const value = e.target.value;
    if (value === 'Otro') {
      setMostrarOtroProgramaOrigen(true);
      setForm({ ...form, programa_origen: '', programa_origen_id: '' });
    } else {
      const seleccionada = programasOrigen.find((programa) => getProgramaId(programa) === value);
      setMostrarOtroProgramaOrigen(false);
      setForm({
        ...form,
        programa_origen: seleccionada ? getProgramaLabel(seleccionada) : value,
        programa_origen_id: value,
      });
    }
  };

  const handleDestinoChange = (e) => {
    const value = e.target.value;
    const seleccionada = instituciones.find((inst) => getInstitucionId(inst) === value);
    if (seleccionada) {
      setSelectedInstitucionDestinoId(value);
      setForm({
        ...form,
        institucion_destino: getInstitucionLabel(seleccionada),
        institucion_destino_id: value,
        programa_destino: '',
        programa_destino_id: '',
      });
    } else {
      setSelectedInstitucionDestinoId(null);
      setForm({
        ...form,
        institucion_destino: '',
        institucion_destino_id: '',
        programa_destino: '',
        programa_destino_id: '',
      });
    }
  };

  const handleProgramaDestinoChange = (e) => {
    const value = e.target.value;
    if (value === 'Otro') {
      setMostrarOtroProgramaDestino(true);
      setForm({ ...form, programa_destino: '', programa_destino_id: '' });
    } else {
      const seleccionada = programasDestino.find((programa) => getProgramaId(programa) === value);
      setMostrarOtroProgramaDestino(false);
      setForm({
        ...form,
        programa_destino: seleccionada ? getProgramaLabel(seleccionada) : value,
        programa_destino_id: value,
      });
    }
  };

  const formatApiError = (errorValue) => {
    if (!errorValue) return 'Error al crear la solicitud.';
    if (typeof errorValue === 'string') return errorValue;
    if (Array.isArray(errorValue)) {
      return errorValue
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item?.msg) return item.msg;
          if (item?.detail) return formatApiError(item.detail);
          return JSON.stringify(item);
        })
        .filter(Boolean)
        .join(' • ');
    }
    if (typeof errorValue === 'object') {
      if (errorValue.detail) return formatApiError(errorValue.detail);
      if (errorValue.msg) return errorValue.msg;
      return JSON.stringify(errorValue);
    }
    return String(errorValue);
  };

  const canAdvanceOrigen = mostrarOtroOrigen
    ? form.institucion_origen.trim().length > 0
    : Boolean(form.institucion_origen_id);
  const canAdvanceProgramaOrigen = mostrarOtroProgramaOrigen
    ? form.programa_origen.trim().length > 0
    : Boolean(form.programa_origen_id);
  const canAdvanceDestino = Boolean(form.institucion_destino_id) && (
    mostrarOtroProgramaDestino ? form.programa_destino.trim().length > 0 : Boolean(form.programa_destino_id)
  );

  const puedeAvanzar = {
    0: true,
    1: canAdvanceOrigen && canAdvanceProgramaOrigen,
    2: canAdvanceDestino,
    3: true,
    4: true,
  }[paso] ?? true;

  const irSiguiente = () => setPaso((p) => Math.min(p + 1, PASOS.length - 1));
  const irAtras = () => setPaso((p) => Math.max(p - 1, 0));

  const handleConfirmar = async () => {
    setCargando(true);
    try {
      const payload = {
        cedula: form.cedula,
        telefono: form.telefono,
        correo_contacto: form.correo_contacto,
      };

      if (mostrarOtroOrigen || mostrarOtroProgramaOrigen) {
        payload.institucion_origen_texto = form.institucion_origen;
        payload.programa_origen_texto = form.programa_origen;
      } else if (form.programa_origen_id) {
        payload.programa_origen_id = form.programa_origen_id;
      }

      if (mostrarOtroProgramaDestino) {
        payload.institucion_destino_texto = form.institucion_destino;
        payload.programa_destino_texto = form.programa_destino;
      } else if (form.programa_destino_id) {
        payload.programa_destino_id = form.programa_destino_id;
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await client.post('/solicitudes/', payload);
      const data = response.data;
      const solicitudId = data?.id ?? data?.solicitud?.id ?? data?.data?.id;
      if (!solicitudId) {
        throw new Error('No se pudo obtener el ID de la solicitud creada.');
      }
      setSolicitudCreadaId(solicitudId);

      const fallos = [];
      for (let i = 0; i < notasBuffer.length; i++) {
        const archivo = notasBuffer[i];
        setProgresoActual({ index: i + 1, total: notasBuffer.length, pct: 0 });
        try {
          const formData = new FormData();
          formData.append('file', archivo);
          await client.post(`/documentos/${solicitudId}/notas`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (evt) => {
              if (evt.total) {
                const pct = Math.round((evt.loaded / evt.total) * 100);
                setProgresoActual((prev) => (prev ? { ...prev, pct } : prev));
              }
            },
          });
        } catch {
          fallos.push(archivo.name);
        }
      }
      setErroresSubida(fallos);

      try {
        await client.post(`/solicitudes/${solicitudId}/enviar`);
        setEnvioExitoso(true);
      } catch {
        setEnvioExitoso(false);
      }

      setPasoConfirmado(true);
    } catch (err) {
      const apiError = err.response?.data?.detail ?? err.response?.data ?? err.message;
      showError(formatApiError(apiError));
    } finally {
      setCargando(false);
      setProgresoActual(null);
    }
  };

  if (bloqueado) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <PageHeader title="Nueva solicitud" onBack={() => navigate('/solicitudes')} />
          <Card>
            <EmptyState
              mascot="/img/Iaerror.svg"
              title="Ya tienes una solicitud activa"
              description="Solo puedes crear una nueva solicitud si tu solicitud anterior fue rechazada."
              action={<Button onClick={() => navigate('/solicitudes')}>Ver mis solicitudes</Button>}
            />
          </Card>
        </main>
      </div>
    );
  }

  if (pasoConfirmado) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Card className="text-center py-10">
            <img src="/img/Iaaprobada.svg" alt="" className="w-20 h-20 mx-auto mb-5 animate-scale-in" />
            <h1 className="text-xl font-semibold text-ink-900 mb-2">
              {envioExitoso ? '¡Tu solicitud fue creada y enviada!' : '¡Tu solicitud fue creada!'}
            </h1>
            <p className="text-sm text-ink-500 max-w-sm mx-auto">
              {envioExitoso
                ? 'La recibimos correctamente. Un coordinador la revisará pronto y podrás seguir su estado en cualquier momento.'
                : 'Se guardó como borrador. Termina de enviarla desde el detalle de tu solicitud cuando estés listo.'}
            </p>
            {erroresSubida.length > 0 && (
              <Alert tone="warning" className="mt-5 text-left max-w-sm mx-auto">
                No se pudieron subir {erroresSubida.length} documento(s) ({erroresSubida.join(', ')}). Podrás subirlos de nuevo desde el detalle de tu solicitud.
              </Alert>
            )}
            <Button onClick={() => navigate(`/solicitudes/${solicitudCreadaId}`)} className="mt-6">
              Ver mi solicitud
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const val = (v) => v || 'No especificado';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="Nueva solicitud" onBack={() => navigate('/solicitudes')} />

        <Stepper steps={PASOS} current={paso} />

        <Card>
          {paso === 0 && (
            <div className="flex flex-col gap-4">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Datos personales</h2>
              <Input label="Cédula" type="text" name="cedula" value={form.cedula} onChange={handleChange} />
              <Input label="Teléfono" type="text" name="telefono" value={form.telefono} onChange={handleChange} />
              <Input
                label="Correo de contacto"
                type="email"
                name="correo_contacto"
                value={form.correo_contacto}
                onChange={handleChange}
              />
            </div>
          )}

          {paso === 1 && (
            <div className="flex flex-col gap-4">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Institución de origen</h2>
              <Select
                label="Institución de origen"
                required
                name="institucion_origen"
                value={mostrarOtroOrigen ? 'Otro' : form.institucion_origen_id || ''}
                onChange={handleOrigenChange}
              >
                <option value="">Seleccione una institución</option>
                {cargandoInstituciones ? (
                  <option value="" disabled>Cargando instituciones...</option>
                ) : (
                  instituciones.map((institucion) => (
                    <option key={getInstitucionId(institucion)} value={getInstitucionId(institucion)}>
                      {getInstitucionLabel(institucion)}
                    </option>
                  ))
                )}
                <option value="Otro">Otro</option>
              </Select>

              {mostrarOtroOrigen && (
                <Input
                  label="Otra institución de origen"
                  required
                  type="text"
                  name="institucion_origen"
                  value={form.institucion_origen}
                  onChange={handleChange}
                  placeholder="Escriba la institución de origen"
                />
              )}

              <Select
                label="Programa de origen"
                required
                name="programa_origen"
                value={mostrarOtroProgramaOrigen ? 'Otro' : form.programa_origen_id || ''}
                onChange={handleProgramaOrigenChange}
                disabled={programaOrigenDisabled}
              >
                <option value="">Seleccione un programa</option>
                {cargandoProgramas ? (
                  <option value="" disabled>Cargando programas...</option>
                ) : programasOrigen.length === 0 ? (
                  <option value="" disabled>No hay programas para esta institución</option>
                ) : (
                  programasOrigen.map((programa) => (
                    <option key={getProgramaId(programa)} value={getProgramaId(programa)}>
                      {getProgramaLabel(programa)}
                    </option>
                  ))
                )}
                <option value="Otro">Otro</option>
              </Select>

              {mostrarOtroProgramaOrigen && (
                <Input
                  label="Otro programa de origen"
                  required
                  type="text"
                  name="programa_origen"
                  value={form.programa_origen}
                  onChange={handleChange}
                  placeholder="Escriba el programa de origen"
                />
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="flex flex-col gap-4">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Institución de destino</h2>
              <Select
                label="Institución de destino"
                required
                name="institucion_destino"
                value={form.institucion_destino_id || ''}
                onChange={handleDestinoChange}
                hint="El destino solo puede ser la Autónoma."
              >
                <option value="">Seleccione una institución</option>
                {instituciones
                  .filter((item) => getInstitucionLabel(item) === DESTINO_AUTONOMA)
                  .map((institucion) => (
                    <option key={getInstitucionId(institucion)} value={getInstitucionId(institucion)}>
                      {getInstitucionLabel(institucion)}
                    </option>
                  ))}
              </Select>

              <Select
                label="Programa de destino"
                required
                name="programa_destino"
                value={mostrarOtroProgramaDestino ? 'Otro' : form.programa_destino_id || ''}
                onChange={handleProgramaDestinoChange}
                disabled={programaDestinoDisabled}
              >
                <option value="">Seleccione un programa</option>
                {cargandoProgramas ? (
                  <option value="" disabled>Cargando programas...</option>
                ) : programasDestino.length === 0 ? (
                  <option value="" disabled>No hay programas para esta institución</option>
                ) : (
                  programasDestino.map((programa) => (
                    <option key={getProgramaId(programa)} value={getProgramaId(programa)}>
                      {getProgramaLabel(programa)}
                    </option>
                  ))
                )}
                <option value="Otro">Otro</option>
              </Select>

              {mostrarOtroProgramaDestino && (
                <Input
                  label="Otro programa de destino"
                  required
                  type="text"
                  name="programa_destino"
                  value={form.programa_destino}
                  onChange={handleChange}
                  placeholder="Escriba el programa de destino"
                />
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="flex flex-col gap-4">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Documentos</h2>
              <p className="text-sm text-ink-500 -mt-2">
                Sube tu certificado de notas académicas (hasta {MAX_DOCUMENTOS} archivos). Este paso es opcional: también puedes subirlos después desde el detalle de tu solicitud.
              </p>

              {notasBuffer.map((archivo, i) => (
                <UploadPDF
                  key={i}
                  label={`Certificado de notas — documento ${i + 1}`}
                  file={archivo}
                  onRemove={() => setNotasBuffer((prev) => prev.filter((_, idx) => idx !== i))}
                  onFile={(nuevo) => setNotasBuffer((prev) => prev.map((f, idx) => idx === i ? nuevo : f))}
                />
              ))}

              {notasBuffer.length < MAX_DOCUMENTOS && (
                <UploadPDF
                  label={`Certificado de notas — documento ${notasBuffer.length + 1}`}
                  hint="Solo PDF."
                  onFile={(archivo) => setNotasBuffer((prev) => [...prev, archivo])}
                />
              )}
            </div>
          )}

          {paso === 4 && (
            <div className="flex flex-col gap-5">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Revisión</h2>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Datos personales</p>
                  <button type="button" onClick={() => setPaso(0)} className="text-xs text-primary-700 hover:underline inline-flex items-center gap-1">
                    <Pencil className="w-3 h-3" aria-hidden="true" /> Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-ink-400 text-xs">Cédula</p><p className="text-ink-800 font-medium">{val(form.cedula)}</p></div>
                  <div><p className="text-ink-400 text-xs">Teléfono</p><p className="text-ink-800 font-medium">{val(form.telefono)}</p></div>
                  <div className="sm:col-span-2"><p className="text-ink-400 text-xs">Correo de contacto</p><p className="text-ink-800 font-medium">{val(form.correo_contacto)}</p></div>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Institución de origen</p>
                  <button type="button" onClick={() => setPaso(1)} className="text-xs text-primary-700 hover:underline inline-flex items-center gap-1">
                    <Pencil className="w-3 h-3" aria-hidden="true" /> Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-ink-400 text-xs">Institución</p><p className="text-ink-800 font-medium">{val(form.institucion_origen)}</p></div>
                  <div><p className="text-ink-400 text-xs">Programa</p><p className="text-ink-800 font-medium">{val(form.programa_origen)}</p></div>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Institución de destino</p>
                  <button type="button" onClick={() => setPaso(2)} className="text-xs text-primary-700 hover:underline inline-flex items-center gap-1">
                    <Pencil className="w-3 h-3" aria-hidden="true" /> Editar
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><p className="text-ink-400 text-xs">Institución</p><p className="text-ink-800 font-medium">{val(form.institucion_destino)}</p></div>
                  <div><p className="text-ink-400 text-xs">Programa</p><p className="text-ink-800 font-medium">{val(form.programa_destino)}</p></div>
                </div>
              </div>

              <div className="pt-4 border-t border-ink-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">Documentos</p>
                  <button type="button" onClick={() => setPaso(3)} className="text-xs text-primary-700 hover:underline inline-flex items-center gap-1">
                    <Pencil className="w-3 h-3" aria-hidden="true" /> Editar
                  </button>
                </div>
                <p className="text-sm text-ink-700">
                  {notasBuffer.length === 0 ? 'Ningún documento seleccionado.' : `${notasBuffer.length} documento(s) seleccionado(s).`}
                </p>
              </div>
            </div>
          )}

          {paso === 5 && (
            <div className="flex flex-col gap-4">
              <h2 ref={tituloPasoRef} tabIndex={-1} className="text-lg font-semibold text-ink-900 mb-1 focus:outline-none">Confirmación</h2>
              <p className="text-sm text-ink-500">
                Revisa que todo esté correcto y confirma para crear tu solicitud de homologación.
                {notasBuffer.length > 0 && ' Tus documentos se subirán automáticamente.'}
              </p>
              {progresoActual && (
                <div className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-3">
                  <p className="text-sm text-ink-700 mb-2">
                    Subiendo documento {progresoActual.index} de {progresoActual.total}...
                  </p>
                  <div className="h-1.5 rounded-full bg-ink-200 overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${progresoActual.pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6 pt-4 border-t border-ink-100">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={paso === 0 ? () => navigate('/solicitudes') : irAtras}
              disabled={cargando}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {paso === 0 ? 'Cancelar' : 'Atrás'}
            </Button>
            {paso < PASOS.length - 1 ? (
              <Button type="button" className="flex-1" onClick={irSiguiente} disabled={!puedeAvanzar}>
                Siguiente
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button type="button" className="flex-1" onClick={handleConfirmar} loading={cargando}>
                {cargando ? 'Creando solicitud...' : 'Confirmar y crear solicitud'}
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
