import { cn } from '../lib/cn';

export default function Spinner({ texto = 'Cargando...', fullScreen = false }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-6',
      fullScreen ? 'flex-1 py-16' : 'py-16 sm:py-20',
    )}>
      <div className="relative w-40 h-40 sm:w-52 sm:h-52 shrink-0">
        {/* soft radar pings */}
        <span className="absolute inset-0 rounded-full bg-primary-400/20 animate-ping" style={{ animationDuration: '2.4s' }} aria-hidden="true" />
        <span className="absolute inset-8 rounded-full bg-accent-400/20 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.6s' }} aria-hidden="true" />
        <div className="absolute inset-6 rounded-full bg-primary-500/10 blur-2xl" aria-hidden="true" />

        {/* orbiting decorations */}
        <div className="absolute -top-1 left-8 w-3.5 h-3.5 rounded-full bg-accent-400/80 animate-float" aria-hidden="true" />
        <div className="absolute bottom-3 -left-2 w-5 h-5 rounded-full border-2 border-primary-300/60 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true" />
        <div className="absolute top-8 -right-1 w-4 h-4 rounded-full bg-primary-300/60 animate-float" style={{ animationDelay: '1.6s' }} aria-hidden="true" />

        <img
          src="/img/Iapensando.svg"
          alt=""
          className="relative z-10 w-full h-full object-contain animate-float drop-shadow-[0_20px_35px_rgba(5,54,134,0.2)]"
        />
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <p className="text-lg sm:text-xl font-semibold text-ink-900 tracking-tight">{texto}</p>
        <div className="flex items-center gap-1.5" role="status" aria-label={texto}>
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0.15s' }} />
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}
