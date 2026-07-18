import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const CONFIG = {
  success: { icon: CheckCircle2, iconClass: 'bg-success-100 text-success-700', label: 'Éxito' },
  danger: { icon: AlertTriangle, iconClass: 'bg-danger-100 text-danger-700', label: 'Error' },
  warning: { icon: AlertTriangle, iconClass: 'bg-accent-200 text-accent-900', label: 'Advertencia' },
  info: { icon: Info, iconClass: 'bg-primary-100 text-primary-700', label: 'Aviso' },
};

export default function FeedbackModal({ feedback, onClose }) {
  const tone = feedback?.tone ?? 'info';
  const { icon: Icon, iconClass, label } = CONFIG[tone] ?? CONFIG.info;

  return (
    <Modal open={!!feedback} onClose={onClose} size="sm" ariaLabel={label}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconClass}`}>
          <Icon className="w-7 h-7" aria-hidden="true" />
        </div>
        <p className="text-sm text-ink-700 leading-relaxed mb-6">{feedback?.message}</p>
        <Button onClick={onClose} className="w-full">Aceptar</Button>
      </div>
    </Modal>
  );
}
