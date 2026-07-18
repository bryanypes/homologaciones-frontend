import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/cn';

const fieldClasses = (error) => cn(
  'w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400',
  'bg-white transition-shadow duration-150',
  'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
  'disabled:bg-ink-50 disabled:text-ink-400 disabled:cursor-not-allowed',
  error ? 'border-danger-200 focus:ring-danger-200 focus:border-danger-600' : 'border-ink-200',
);

function FieldWrapper({ label, error, hint, required, className, fieldId, messageId, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-700">
          {label}
          {required && <span className="text-danger-600 ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && <p id={messageId} role="alert" className="text-xs text-danger-600">{error}</p>}
      {!error && hint && <p id={messageId} className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Input({ label, error, hint, required, className, id, icon: Icon, type = 'text', 'aria-describedby': describedBy, ...rest }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = (error || hint) ? `${fieldId}-message` : undefined;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className} fieldId={fieldId} messageId={messageId}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-400" aria-hidden="true" />
        )}
        <input
          id={fieldId}
          type={isPassword ? (visible ? 'text' : 'password') : type}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={cn(messageId, describedBy) || undefined}
          className={cn(fieldClasses(error), Icon && 'pl-10', isPassword && 'pr-11')}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
          >
            {visible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}

export function Textarea({ label, error, hint, required, className, id, 'aria-describedby': describedBy, ...rest }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = (error || hint) ? `${fieldId}-message` : undefined;
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className} fieldId={fieldId} messageId={messageId}>
      <textarea
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={cn(messageId, describedBy) || undefined}
        className={fieldClasses(error)}
        {...rest}
      />
    </FieldWrapper>
  );
}

export function Select({ label, error, hint, required, className, id, 'aria-describedby': describedBy, children, ...rest }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = (error || hint) ? `${fieldId}-message` : undefined;
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className} fieldId={fieldId} messageId={messageId}>
      <select
        id={fieldId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={cn(messageId, describedBy) || undefined}
        className={cn(fieldClasses(error), 'bg-white cursor-pointer')}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
