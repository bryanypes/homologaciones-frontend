import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';

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

export default function NuevaSolicitud() {
  const navigate = useNavigate();
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
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);
  const [cargandoProgramas, setCargandoProgramas] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
      navigate(`/solicitudes/${solicitudId}`);
    } catch (err) {
      const apiError = err.response?.data?.detail ?? err.response?.data ?? err.message;
      setError(formatApiError(apiError));
    } finally {
      setCargando(false);
    }
  };

  if (bloqueado) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/solicitudes')} className="text-gray-400 hover:text-gray-600 text-sm">
              ← Volver
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Nueva solicitud</h1>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-6 text-center">
            <p className="text-amber-800 font-medium mb-2">Ya tienes una solicitud activa</p>
            <p className="text-amber-700 text-sm mb-4">
              Solo puedes crear una nueva solicitud si tu solicitud anterior fue rechazada.
            </p>
            <button
              onClick={() => navigate('/solicitudes')}
              className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900"
            >
              Ver mis solicitudes
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/solicitudes')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Volver
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Nueva solicitud</h1>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 px-6 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo de contacto</label>
              <input
                type="email"
                name="correo_contacto"
                value={form.correo_contacto}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución de origen</label>
              <select
                name="institucion_origen"
                value={mostrarOtroOrigen ? 'Otro' : form.institucion_origen_id || ''}
                onChange={handleOrigenChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              </select>
            </div>

            {mostrarOtroOrigen && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Otra institución de origen</label>
                <input
                  type="text"
                  name="institucion_origen"
                  value={form.institucion_origen}
                  onChange={handleChange}
                  placeholder="Escriba la institución de origen"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa de origen</label>
              <select
                name="programa_origen"
                value={mostrarOtroProgramaOrigen ? 'Otro' : form.programa_origen_id || ''}
                onChange={handleProgramaOrigenChange}
                disabled={programaOrigenDisabled}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              </select>
            </div>

            {mostrarOtroProgramaOrigen && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Otro programa de origen</label>
                <input
                  type="text"
                  name="programa_origen"
                  value={form.programa_origen}
                  onChange={handleChange}
                  placeholder="Escriba el programa de origen"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institución de destino</label>
              <select
                name="institucion_destino"
                value={form.institucion_destino_id || ''}
                onChange={handleDestinoChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una institución</option>
                {instituciones
                  .filter((item) => getInstitucionLabel(item) === DESTINO_AUTONOMA)
                  .map((institucion) => (
                    <option key={getInstitucionId(institucion)} value={getInstitucionId(institucion)}>
                      {getInstitucionLabel(institucion)}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">El destino solo puede ser la Autónoma.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa de destino</label>
              <select
                name="programa_destino"
                value={mostrarOtroProgramaDestino ? 'Otro' : form.programa_destino_id || ''}
                onChange={handleProgramaDestinoChange}
                disabled={programaDestinoDisabled}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
              </select>
            </div>

            {mostrarOtroProgramaDestino && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Otro programa de destino</label>
                <input
                  type="text"
                  name="programa_destino"
                  value={form.programa_destino}
                  onChange={handleChange}
                  placeholder="Escriba el programa de destino"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate('/solicitudes')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50"
              >
                {cargando ? 'Creando...' : 'Crear solicitud'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}