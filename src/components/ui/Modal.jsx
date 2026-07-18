import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, ariaLabel, children, size = 'md', fullBleed = false }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusables = () => panel ? Array.from(panel.querySelectorAll(FOCUSABLE)) : [];

    const toFocus = focusables()[0] ?? panel;
    toFocus?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }[size] ?? 'max-w-md';

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  if (fullBleed) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-ink-900/70 backdrop-blur-sm"
        onMouseDown={handleBackdropClick}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex items-center justify-between bg-primary-600 px-4 py-3 shrink-0">
            <span id={titleId} className="text-white text-sm font-medium truncate">{title}</span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm px-3 py-1.5 border border-white/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Cerrar
            </button>
          </div>
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm px-4"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn('w-full bg-white rounded-2xl shadow-float-lg px-6 py-6 sm:px-7 sm:py-7 animate-scale-in', maxWidth)}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 id={titleId} className="text-lg font-semibold text-ink-900">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
