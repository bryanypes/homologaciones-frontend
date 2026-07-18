import { Sparkles } from 'lucide-react';
import Button from './ui/Button';

export default function AIProcessingScreen({
  title = 'Analizando la información académica...',
  subtitle = 'La Inteligencia Artificial está comparando los planes de estudio. Puede tardar hasta un minuto.',
  onRefresh,
}) {
  return (
    <div className="flex flex-col items-center text-center py-10 sm:py-14 px-4">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 mb-7 shrink-0">
        {/* soft radar pings */}
        <span className="absolute inset-0 rounded-full bg-primary-400/20 animate-ping" style={{ animationDuration: '2.4s' }} aria-hidden="true" />
        <span className="absolute inset-6 rounded-full bg-accent-400/25 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.6s' }} aria-hidden="true" />

        {/* ambient glow */}
        <div className="absolute inset-8 rounded-full bg-primary-500/10 blur-2xl" aria-hidden="true" />

        {/* orbiting decorations */}
        <div className="absolute -top-1 left-6 w-3.5 h-3.5 rounded-full bg-accent-400/80 animate-float" aria-hidden="true" />
        <div className="absolute bottom-2 -left-2 w-5 h-5 rounded-full border-2 border-primary-300/60 animate-float" style={{ animationDelay: '1s' }} aria-hidden="true" />
        <div className="absolute top-6 -right-1 w-4 h-4 rounded-full bg-primary-300/60 animate-float" style={{ animationDelay: '1.6s' }} aria-hidden="true" />
        <Sparkles className="absolute top-0 right-4 w-6 h-6 text-accent-500 animate-twinkle" aria-hidden="true" />
        <Sparkles className="absolute bottom-4 right-0 w-5 h-5 text-primary-400 animate-twinkle" style={{ animationDelay: '0.9s' }} aria-hidden="true" />

        <img
          src="/img/Iapensando.svg"
          alt=""
          className="relative z-10 w-full h-full object-contain animate-float drop-shadow-[0_18px_30px_rgba(5,54,134,0.18)]"
        />

        {/* thinking dots, like a chat "typing" indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-card border border-ink-100">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0.15s' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold text-ink-900 tracking-tight mb-2 max-w-md">{title}</h2>
      <p className="text-sm text-ink-500 max-w-sm mb-8 leading-relaxed">{subtitle}</p>

      <div className="w-full max-w-xs h-2 rounded-full bg-ink-100 overflow-hidden relative mb-2" role="status" aria-label="Procesando">
        <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary-600 animate-indeterminate" />
      </div>

      {onRefresh && (
        <Button variant="secondary" size="sm" onClick={onRefresh} className="mt-6">
          Recargar
        </Button>
      )}
    </div>
  );
}
