const ESTADOS = {
  borrador:        'bg-gray-100 text-gray-700',
  enviada:         'bg-blue-100 text-blue-700',
  en_revision:     'bg-yellow-100 text-yellow-700',
  procesando_ia:   'bg-orange-100 text-orange-700',
  pendiente_rector:'bg-purple-100 text-purple-700',
  aprobada:        'bg-green-100 text-green-700',
  rechazada:       'bg-red-100 text-red-700',
};

const ETIQUETAS = {
  borrador:        'Borrador',
  enviada:         'Enviada',
  en_revision:     'En revisión',
  procesando_ia:   'Procesando IA',
  pendiente_rector:'Pendiente rector',
  aprobada:        'Aprobada',
  rechazada:       'Rechazada',
};

export default function EstadoBadge({ estado }) {
  const clase = ESTADOS[estado] || 'bg-gray-100 text-gray-600';
  const etiqueta = ETIQUETAS[estado] || estado;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clase}`}>
      {etiqueta}
    </span>
  );
}