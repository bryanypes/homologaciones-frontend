import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" ariaLabel={title || 'Confirmar acción'}>
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-danger-100 text-danger-700 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </div>
        {title && <h2 className="text-base font-semibold text-ink-900 mb-1.5">{title}</h2>}
        <p className="text-sm text-ink-600 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onCancel} className="flex-1">{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
