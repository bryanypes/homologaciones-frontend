import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '../../lib/cn';

const ICON_TONES = {
  danger: 'bg-danger-100 text-danger-700',
  warning: 'bg-accent-200 text-accent-900',
  primary: 'bg-primary-100 text-primary-700',
};

const BUTTON_VARIANTS = {
  danger: 'danger',
  warning: 'accent',
  primary: 'primary',
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  icon: Icon = AlertTriangle,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" ariaLabel={title || 'Confirmar acción'}>
      <div className="flex flex-col items-center text-center">
        <div className={cn('w-14 h-14 rounded-full flex items-center justify-center mb-4', ICON_TONES[tone] ?? ICON_TONES.danger)}>
          <Icon className="w-7 h-7" aria-hidden="true" />
        </div>
        {title && <h2 className="text-base font-semibold text-ink-900 mb-1.5">{title}</h2>}
        <p className="text-sm text-ink-600 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onCancel} className="flex-1">{cancelLabel}</Button>
          <Button variant={BUTTON_VARIANTS[tone] ?? 'danger'} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
