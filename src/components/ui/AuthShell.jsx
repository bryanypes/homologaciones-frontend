import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function AuthShell({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-10 sm:py-14">
      {/* Decorative background — solid, non-overlapping shapes so colors never blend/mix */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg className="absolute -top-20 -right-28 w-[380px] sm:w-[480px] text-primary-100" viewBox="0 0 400 400" fill="none">
          <path fill="currentColor" d="M400,0 L400,240 C350,280 320,200 250,210 C180,220 190,130 130,100 C85,78 55,35 30,0 Z" />
        </svg>
        <svg className="absolute -bottom-20 -left-28 w-[380px] sm:w-[480px] text-accent-100" viewBox="0 0 400 400" fill="none">
          <path fill="currentColor" d="M0,400 L0,160 C50,120 80,200 150,190 C220,180 210,270 270,300 C315,322 345,365 370,400 Z" />
        </svg>

        {/* dotted patches */}
        <div
          className="hidden sm:block absolute top-[20%] left-[8%] w-28 h-28 text-accent-500/40"
          style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}
        />
        <div
          className="hidden sm:block absolute bottom-[18%] right-[10%] w-28 h-28 text-primary-500/30"
          style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}
        />

        {/* floating circles + sparkles */}
        <div className="hidden sm:block absolute top-[14%] left-[24%] w-9 h-9 rounded-full border-2 border-accent-400/70 animate-float" />
        <div className="hidden sm:block absolute bottom-[22%] right-[24%] w-6 h-6 rounded-full bg-primary-300/50 animate-float" style={{ animationDelay: '1s' }} />
        <Sparkles className="hidden sm:block absolute top-[32%] right-[14%] w-5 h-5 text-accent-500/80 animate-twinkle" />
        <Sparkles className="hidden sm:block absolute bottom-[32%] left-[16%] w-4 h-4 text-primary-400/70 animate-twinkle" style={{ animationDelay: '0.8s' }} />
      </div>

      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 bg-white/70 hover:bg-white hover:text-primary-700 backdrop-blur-sm border border-ink-100 transition-all px-3.5 py-2 rounded-full shadow-soft"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver al inicio
      </Link>

      <div className="w-full max-w-4xl relative z-10 animate-fade-in-up">
        <div className="rounded-[20px] bg-white shadow-float-lg overflow-hidden grid lg:grid-cols-2">

          {/* Brand / mascot panel */}
          <div className="order-1 lg:order-2 relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex flex-col items-center justify-center text-center px-8 py-12 lg:py-14 overflow-hidden min-h-[360px] lg:min-h-[520px]">
            {/* generous gold accents, solid so nothing blends into green */}
            <svg className="absolute -top-10 -right-16 w-56 h-56 text-accent-500" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <path fill="currentColor" d="M200,0 L200,120 C170,140 150,100 110,105 C70,110 80,50 40,30 C20,20 10,8 0,0 Z" />
            </svg>
            <svg className="absolute -bottom-12 -left-14 w-48 h-48 text-accent-500" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <path fill="currentColor" d="M0,200 L0,90 C30,70 45,110 85,105 C125,100 120,155 155,175 C175,187 190,195 200,200 Z" />
            </svg>

            {/* scattered circles + stars for a livelier, more dynamic panel */}
            <div className="absolute top-8 left-10 w-3 h-3 rounded-full bg-accent-400 animate-twinkle" aria-hidden="true" />
            <div className="absolute top-[22%] right-[12%] w-5 h-5 rounded-full border-2 border-accent-300/70 animate-float" aria-hidden="true" />
            <div className="absolute top-[38%] left-[8%] w-4 h-4 rounded-full bg-white/20 animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
            <div className="absolute bottom-[26%] left-[14%] w-7 h-7 rounded-full border-2 border-white/30 animate-float" style={{ animationDelay: '0.5s' }} aria-hidden="true" />
            <div className="absolute bottom-[16%] right-[16%] w-3.5 h-3.5 rounded-full bg-accent-300/80 animate-float" style={{ animationDelay: '1.7s' }} aria-hidden="true" />
            <div className="absolute top-[12%] right-[30%] w-2.5 h-2.5 rounded-full bg-white/40 animate-twinkle" style={{ animationDelay: '0.3s' }} aria-hidden="true" />
            <Sparkles className="absolute top-[16%] left-[20%] w-5 h-5 text-accent-300 animate-twinkle" aria-hidden="true" />
            <Sparkles className="absolute bottom-8 right-10 w-6 h-6 text-accent-300 animate-twinkle" aria-hidden="true" style={{ animationDelay: '0.6s' }} />
            <Sparkles className="absolute bottom-[36%] right-[8%] w-4 h-4 text-white/70 animate-twinkle" aria-hidden="true" style={{ animationDelay: '1s' }} />
            <Sparkles className="absolute top-[46%] right-[6%] w-3.5 h-3.5 text-accent-200 animate-twinkle" aria-hidden="true" style={{ animationDelay: '1.4s' }} />

            {/* light spotlight so the navy mascot never blends into the navy panel */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 mb-6 shrink-0">
              <div className="absolute inset-0 rounded-full bg-accent-400/25 blur-3xl" aria-hidden="true" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white to-accent-50 shadow-float-lg" aria-hidden="true" />
              <div className="absolute -inset-1.5 rounded-full border-2 border-white/40" aria-hidden="true" />
              <div className="absolute -inset-4 rounded-full border border-white/20" aria-hidden="true" />
              <img
                src="/img/IAsaludando.svg"
                alt=""
                className="relative z-10 w-full h-full object-contain p-7 animate-float drop-shadow-[0_14px_24px_rgba(2,42,138,0.25)]"
              />
            </div>

            <p className="relative z-10 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Homologa<span className="text-accent-400">IA</span>
            </p>
            <p className="relative z-10 text-primary-100 text-sm mt-1 max-w-[240px]">
              Corporación Universitaria Autónoma del Cauca
            </p>
          </div>

          {/* Form panel */}
          <div className="order-2 lg:order-1 px-8 py-10 sm:px-10 lg:py-14 flex flex-col justify-center">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" aria-hidden="true" />
              </div>
            )}
            <h1 className="text-2xl sm:text-[28px] font-semibold text-ink-900 tracking-tight">{title}</h1>
            <p className="text-ink-500 text-sm mt-1.5 mb-6">{subtitle}</p>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
