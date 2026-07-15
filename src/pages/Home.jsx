const PASOS = [
  {
    numero: '01',
    actor: 'Estudiante',
    color: 'bg-blue-50 border-blue-200',
    accion: 'Crea la solicitud',
    descripcion: 'Ingresa tus datos, la institución de origen y el programa al que quieres ingresar en Corporación Universitaria Autónoma del Cauca.',
  },
  {
    numero: '02',
    actor: 'Estudiante',
    color: 'bg-blue-50 border-blue-200',
    accion: 'Sube tu certificado de notas',
    descripcion: 'Adjunta tu certificado de notas en PDF. Es el único documento que necesitas para iniciar.',
  },
  {
    numero: '03',
    actor: 'Coordinador',
    color: 'bg-yellow-50 border-yellow-200',
    accion: 'Revisión académica',
    descripcion: 'Un coordinador toma tu solicitud, revisa los documentos y sube el pensum del programa destino.',
  },
  {
    numero: '04',
    actor: 'Inteligencia Artificial',
    color: 'bg-orange-50 border-orange-200',
    accion: 'Análisis automatizado',
    descripcion: 'El sistema compara tus materias cursadas con las del programa destino y genera una tabla de equivalencias con porcentaje de similitud.',
  },
  {
    numero: '05',
    actor: 'Rector',
    color: 'bg-purple-50 border-purple-200',
    accion: 'Decisión final',
    descripcion: 'El rector revisa el análisis, aprueba o rechaza la homologación y descarga la resolución oficial.',
  },
];

const ROLES = [
  {
    nombre: 'Estudiante',
    icono: '🎓',
    descripcion: 'Crea tu solicitud, sube tus notas y hace seguimiento en tiempo real del estado de tu trámite.',
  },
  {
    nombre: 'Coordinador',
    icono: '📋',
    descripcion: 'Gestiona las solicitudes recibidas, sube el pensum del programa destino y activa el análisis con IA.',
  },
  {
    nombre: 'Rector',
    icono: '✍️',
    descripcion: 'Revisa el resultado del análisis, toma la decisión final y genera la resolución oficial en Word.',
  },
];

const ESTADOS = [
  { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  { label: 'En revisión', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Procesando IA', color: 'bg-orange-100 text-orange-700' },
  { label: 'Pendiente rector', color: 'bg-purple-100 text-purple-700' },
  { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="bg-[#1F3864] text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-300 uppercase tracking-widest mb-0.5">Corporación Universitaria Autónoma del Cauca</p>
            <h1 className="text-base font-semibold leading-tight">Sistema de Homologaciones</h1>
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-white text-[#1F3864] text-sm font-medium rounded hover:bg-blue-50 transition"
          >
            Ingresar
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1F3864] text-white pb-16 pt-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Homologa tus materias de forma ágil y transparente
          </h2>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Un proceso que antes tardaba semanas ahora se gestiona en línea.
            Inteligencia artificial analiza tus materias, el rector decide y
            la resolución oficial se genera automáticamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/register"
              className="px-6 py-3 bg-white text-[#1F3864] font-semibold rounded-md hover:bg-blue-50 transition"
            >
              Crear cuenta como estudiante
            </a>
            <a
              href="/login"
              className="px-6 py-3 border border-blue-300 text-white font-medium rounded-md hover:bg-blue-800 transition"
            >
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      {/* Qué es una homologación */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">¿Qué es una homologación?</h3>
        <p className="text-gray-600 leading-relaxed">
          Si vienes de otra universidad o programa y quieres continuar tus estudios en Corporación Universitaria Autónoma del Cauca,
          la homologación te permite que las materias que ya cursaste y aprobaste sean reconocidas en tu nuevo programa.
          Así no tienes que volver a tomar clases que ya tomaste.
        </p>
      </section>

      <hr className="max-w-5xl mx-auto border-gray-100" />

      {/* Cómo funciona */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h3 className="text-xl font-semibold text-gray-800 mb-8">¿Cómo funciona el proceso?</h3>
        <div className="flex flex-col gap-4">
          {PASOS.map((paso) => (
            <div key={paso.numero} className={`border rounded-lg px-5 py-4 ${paso.color}`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-gray-300 leading-none mt-0.5 w-8 shrink-0">
                  {paso.numero}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{paso.actor}</span>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">{paso.accion}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{paso.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-gray-100" />

      {/* Estados */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">¿En qué estado está mi solicitud?</h3>
        <p className="text-gray-500 text-sm mb-6">
          Puedes ver el estado de tu solicitud en cualquier momento desde tu cuenta.
        </p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <span
              key={e.label}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${e.color}`}
            >
              {e.label}
            </span>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
          {ESTADOS.map((e, i) => (
            <span key={e.label} className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${e.color}`}>
                {e.label}
              </span>
              {i < ESTADOS.length - 1 && <span className="text-gray-300">→</span>}
            </span>
          ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-gray-100" />

      {/* Roles */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <h3 className="text-xl font-semibold text-gray-800 mb-8">¿Quién hace qué?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ROLES.map((rol) => (
            <div key={rol.nombre} className="border border-gray-200 rounded-lg px-5 py-5">
              <div className="text-3xl mb-3">{rol.icono}</div>
              <p className="font-semibold text-gray-800 mb-2">{rol.nombre}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{rol.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-gray-100" />

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-14 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">¿Listo para comenzar?</h3>
        <p className="text-gray-500 mb-6">
          Crea tu cuenta, sube tus notas y haz seguimiento de tu solicitud en tiempo real.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-3 bg-[#1F3864] text-white font-semibold rounded-md hover:bg-blue-900 transition"
        >
          Crear cuenta
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Corporación Universitaria Autónoma del Cauca — Sistema de Homologaciones Académicas
      </footer>

    </div>
  );
}