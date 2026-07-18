import { Sparkles } from 'lucide-react';
import { cn } from '../lib/cn';

const SIZES = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
};

export default function AIMessage({ mascot, size = 'md', animate = 'animate-float', decorate = false, className, children }) {
  return (
    <div className={cn('flex items-start gap-4', className)}>
      <div className={cn('relative shrink-0', SIZES[size] ?? SIZES.md)}>
        {decorate && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary-500/10 blur-xl -z-10" aria-hidden="true" />
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-accent-400/80 animate-float" aria-hidden="true" />
            <div className="absolute bottom-1 -right-2 w-3.5 h-3.5 rounded-full border-2 border-primary-300/60 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true" />
            <Sparkles className="absolute -top-2 right-3 w-4 h-4 text-accent-500 animate-twinkle" aria-hidden="true" />
          </>
        )}
        <img src={mascot} alt="" className={cn('relative w-full h-full object-contain', animate)} />
      </div>
      <div className="relative flex-1 mt-1 bg-primary-50 border border-primary-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="text-sm text-ink-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
