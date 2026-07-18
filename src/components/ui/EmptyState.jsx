import { cn } from '../../lib/cn';

export default function EmptyState({ mascot = '/img/Iaesperando.svg', title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-6', className)}>
      <img src={mascot} alt="" className="w-16 h-16 mb-4 opacity-90" />
      {title && <p className="text-ink-800 font-medium mb-1">{title}</p>}
      {description && <p className="text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
