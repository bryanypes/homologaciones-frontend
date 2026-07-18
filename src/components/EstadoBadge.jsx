import { FileEdit, Send, Search, Loader2, ClipboardCheck, Gavel, Circle, CheckCircle2, XCircle, CircleSlash } from 'lucide-react';
import Badge from './ui/Badge';

const TONOS = {
  borrador: 'neutral',
  enviada: 'brand',
  en_revision: 'accent',
  procesando_ia: 'accentStrong',
  revision_coordinador: 'brand',
  pendiente_rector: 'brandStrong',
  pendiente: 'neutral',
  aprobada: 'success',
  rechazada: 'danger',
  // Estados de asignatura homologada (HomologacionAsignatura.estado)
  homologada: 'success',
  homologada_parcial: 'accent',
  no_homologada: 'danger',
};

const ETIQUETAS = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  en_revision: 'En revisión',
  procesando_ia: 'Procesando IA',
  revision_coordinador: 'Revisión coordinador',
  pendiente_rector: 'Pendiente vicerrector',
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  homologada: 'Homologada',
  homologada_parcial: 'Homologada parcial',
  no_homologada: 'No homologada',
};

const ICONOS = {
  borrador: FileEdit,
  enviada: Send,
  en_revision: Search,
  procesando_ia: Loader2,
  revision_coordinador: ClipboardCheck,
  pendiente_rector: Gavel,
  pendiente: Circle,
  aprobada: CheckCircle2,
  rechazada: XCircle,
  homologada: CheckCircle2,
  homologada_parcial: CheckCircle2,
  no_homologada: CircleSlash,
};

export default function EstadoBadge({ estado }) {
  const tono = TONOS[estado] || 'neutral';
  const etiqueta = ETIQUETAS[estado] || estado;
  const Icono = ICONOS[estado];
  const pulse = estado === 'procesando_ia' ? 'animate-pulse' : '';
  return (
    <Badge tone={tono} icon={Icono} className={pulse}>
      {etiqueta}
    </Badge>
  );
}
