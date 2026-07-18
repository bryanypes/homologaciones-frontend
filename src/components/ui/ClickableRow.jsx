import { cn } from '../../lib/cn';

export default function ClickableRow({ onClick, children, className }) {
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'cursor-pointer transition-colors hover:bg-ink-50/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
        className,
      )}
    >
      {children}
    </tr>
  );
}
