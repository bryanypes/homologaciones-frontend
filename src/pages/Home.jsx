import { useEffect, useState } from 'react';
import {
  Sparkles, Rocket, PlayCircle, ShieldCheck, Clock, CheckCircle2,
  GraduationCap, ClipboardList, PenLine, UploadCloud, ClipboardCheck,
  Cpu, FileCheck2, Send, Search, Award,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Reveal from '../components/ui/Reveal';

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: '¿Cómo funciona?', href: '#como-funciona' },
  { label: 'Beneficios', href: '#sobre' },
  { label: 'Roles', href: '#roles' },
  { label: 'Acerca de', href: '#sobre' },
];

const PASOS = [
  {
    Icono: ClipboardList,
    actor: 'Estudiante',
    accion: 'Crea tu solicitud',
    descripcion: 'Ingresa tus datos, la institución de origen y el programa al que quieres ingresar.',
  },
  {
    Icono: UploadCloud,
    actor: 'Estudiante',
    accion: 'Sube tus documentos',
    descripcion: 'Adjunta tu certificado de notas en PDF. Es el único documento que necesitas para iniciar.',
  },
  {
    Icono: ClipboardCheck,
    actor: 'Coordinador',
    accion: 'Revisión académica',
    descripcion: 'Un coordinador revisa tus documentos y sube el pensum del programa destino.',
  },
  {
    Icono: Cpu,
    actor: 'Inteligencia Artificial',
    accion: 'IA analiza y compara',
    descripcion: 'El sistema compara tus materias con las del programa destino y calcula su similitud.',
  },
  {
    Icono: Award,
    actor: 'Vicerrector',
    accion: 'Obtén tu resultado',
    descripcion: 'El vicerrector aprueba o rechaza la homologación y firma la resolución oficial.',
  },
];

const ROLES = [
  {
    nombre: 'Estudiante',
    Icono: GraduationCap,
    descripcion: 'Crea tu solicitud, sube tus notas y hace seguimiento en tiempo real del estado de tu trámite.',
  },
  {
    nombre: 'Coordinador',
    Icono: ClipboardList,
    descripcion: 'Gestiona las solicitudes recibidas, sube el pensum del programa destino y activa el análisis con IA.',
  },
  {
    nombre: 'Vicerrector',
    Icono: PenLine,
    descripcion: 'Revisa el resultado del análisis, toma la decisión final y genera la resolución oficial en Word.',
  },
];

const PROCESO = [
  { label: 'Solicitud enviada', Icono: Send },
  { label: 'Documentos recibidos', Icono: FileCheck2 },
  { label: 'Revisión académica', Icono: Search },
  { label: 'IA analizando', Icono: Cpu, pulse: true },
  { label: 'Resultado final', Icono: Award },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#inicio"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-primary-700 focus:px-4 focus:py-2.5 focus:rounded-lg focus:shadow-float-lg focus:font-medium"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/90 backdrop-blur-md border-b border-ink-100 shadow-soft' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#inicio" className="flex items-center gap-2.5 shrink-0 rounded-lg">
            <img src="/img/LOGO.svg" alt="HomologaIA" className="h-9 w-auto rounded-md" />
            <span className={`font-semibold tracking-tight hidden sm:block transition-colors ${scrolled ? 'text-ink-900' : 'text-white'}`}>
              HomologaIA
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-ink-600 hover:text-primary-700 hover:bg-primary-50'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              href="/login"
              variant="ghost"
              size="sm"
              className={!scrolled ? '!text-white hover:!bg-white/10' : ''}
            >
              Iniciar sesión
            </Button>
            <Button href="/register" variant="accent" size="sm">
              <span className="hidden sm:inline">Solicitar homologación</span>
              <span className="sm:hidden">Solicitar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — layered waves */}
      <section id="inicio" tabIndex={-1} className="relative isolate overflow-hidden bg-primary-600 text-white scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 pt-28 sm:pt-32 pb-32 sm:pb-40 grid lg:grid-cols-[1fr_auto] items-center gap-12 relative z-10">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-accent-300 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Plataforma inteligente
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] mb-5 tracking-tight">
              Homologa tus materias en minutos con ayuda de{' '}
              <span className="text-accent-400">Inteligencia Artificial</span>
            </h1>
            <p className="text-primary-100 text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Nuestra IA compara automáticamente tus materias cursadas con las del programa destino,
              agiliza la revisión académica y te guía en cada paso del proceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
              <Button href="/register" variant="accent" size="lg" className="w-full sm:w-auto">
                <Rocket className="w-4 h-4" aria-hidden="true" />
                Comenzar homologación
              </Button>
              <Button
                href="#como-funciona"
                size="lg"
                className="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10"
              >
                <PlayCircle className="w-4 h-4" aria-hidden="true" />
                Conocer cómo funciona
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start text-sm text-primary-100">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-400" aria-hidden="true" /> Seguro y confiable
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-400" aria-hidden="true" /> Ahorra tiempo
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-400" aria-hidden="true" /> 100% en línea
              </span>
            </div>
          </div>

          <div className="relative mx-auto shrink-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
            {/* dotted grid texture */}
            <div
              className="absolute -inset-10 text-accent-400/25"
              style={{ backgroundImage: 'radial-gradient(currentColor 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }}
              aria-hidden="true"
            />
            {/* glow */}
            <div className="absolute inset-0 rounded-full bg-accent-500/40 blur-2xl scale-90" aria-hidden="true" />
            {/* floating decorative shapes */}
            <div className="absolute -top-3 -left-5 w-9 h-9 rounded-full border-2 border-accent-400/60 animate-float" aria-hidden="true" />
            <div className="absolute -bottom-2 -right-3 w-6 h-6 rounded-full bg-accent-400/70 animate-float" style={{ animationDelay: '1.1s' }} aria-hidden="true" />
            <Sparkles className="absolute top-1 right-2 w-6 h-6 text-accent-300 animate-twinkle" aria-hidden="true" />
            <Sparkles className="absolute bottom-8 -left-2 w-4 h-4 text-white/70 animate-twinkle" style={{ animationDelay: '0.9s' }} aria-hidden="true" />

            <img
              src="/img/IAsaludando.svg"
              alt=""
              className="relative z-10 w-full h-full object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.3)] animate-float"
            />
          </div>
        </div>

        {/* Wave layers — accent peeks above white, which peeks above the cream base */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-28 sm:h-44 text-accent-600"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,140 C240,200 480,80 720,120 C960,160 1200,60 1440,120 L1440,320 L0,320 Z" />
        </svg>
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-20 sm:h-32 text-white"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,190 C240,130 480,230 720,170 C960,110 1200,210 1440,160 L1440,320 L0,320 Z" />
        </svg>
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-12 sm:h-20 text-background"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0,250 C240,210 480,280 720,230 C960,180 1200,270 1440,220 L1440,320 L0,320 Z" />
        </svg>
      </section>

      {/* Qué es una homologación */}
      <section id="sobre" className="max-w-4xl mx-auto px-6 py-16 sm:py-20 scroll-mt-16">
        <Reveal>
          <Card className="text-center px-6 py-10 sm:px-14 sm:py-14">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mx-auto mb-5">
              <GraduationCap className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 mb-4 tracking-tight">¿Qué es una homologación?</h2>
            <p className="text-ink-600 leading-relaxed max-w-2xl mx-auto">
              Si vienes de otra universidad o programa y quieres continuar tus estudios en la{' '}
              <strong className="text-ink-900 font-semibold">Corporación Universitaria Autónoma del Cauca</strong>,
              la homologación te permite que las materias que ya{' '}
              <strong className="text-ink-900 font-semibold">cursaste y aprobaste</strong> sean reconocidas en tu nuevo programa.
              Así no tienes que volver a tomar clases que ya tomaste.
            </p>
          </Card>
        </Reveal>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-white border-y border-ink-100 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 mb-3 tracking-tight">¿Cómo funciona el proceso?</h2>
            <p className="text-ink-500 max-w-lg mx-auto">Cinco pasos claros, desde tu solicitud hasta la resolución oficial.</p>
          </Reveal>

          <div className="relative">
            <div className="hidden lg:block absolute left-[8%] right-[8%] top-7 h-0.5 border-t-2 border-dashed border-primary-200" aria-hidden="true" />
            <div className="lg:hidden absolute left-7 top-2 bottom-2 w-0.5 bg-primary-100" aria-hidden="true" />

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-5">
              {PASOS.map((paso, i) => (
                <Reveal
                  key={paso.accion}
                  delay={i * 80}
                  className="relative flex-1 flex items-start lg:flex-col gap-4 lg:gap-0 lg:items-center"
                >
                  <div
                    className={`relative z-10 w-14 h-14 rounded-2xl bg-white border border-primary-100 shadow-card flex items-center justify-center shrink-0 lg:mb-4 ${
                      i % 2 === 1 ? 'lg:translate-y-3' : ''
                    }`}
                  >
                    <paso.Icono className="w-6 h-6 text-primary-600" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent-500 text-ink-900 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <Card
                    className={`flex-1 hover:shadow-float hover:-translate-y-1 transition-all duration-200 lg:text-center ${
                      i % 2 === 1 ? 'lg:translate-y-3' : ''
                    }`}
                  >
                    <p className="text-xs text-ink-400 mb-1">{paso.actor}</p>
                    <h3 className="font-semibold text-ink-900 mb-1.5">{paso.accion}</h3>
                    <p className="text-sm text-ink-600 leading-relaxed">{paso.descripcion}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Estado de la solicitud */}
      <section id="estado" className="max-w-5xl mx-auto px-6 py-16 sm:py-20 scroll-mt-16">
        <Reveal className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 mb-3 tracking-tight">¿En qué estado está mi solicitud?</h2>
          <p className="text-ink-500 max-w-lg mx-auto">Sigue el progreso de tu homologación en tiempo real, paso a paso, desde tu cuenta.</p>
        </Reveal>

        <Reveal className="relative">
          <div className="hidden sm:block absolute left-[8%] right-[8%] top-6 h-0.5 bg-ink-100" aria-hidden="true" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-8">
            {PROCESO.map((paso) => (
              <div key={paso.label} className="relative flex flex-col items-center text-center">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-white ${
                    paso.pulse ? 'bg-accent-600 text-ink-900 animate-pulse' : 'bg-primary-600'
                  }`}
                >
                  <paso.Icono className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-ink-700 leading-snug">{paso.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-white border-y border-ink-100 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 mb-3 tracking-tight">¿Quién hace qué?</h2>
            <p className="text-ink-500 max-w-lg mx-auto">Cada rol cumple una función clara dentro del proceso de homologación.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {ROLES.map((rol, i) => (
              <Reveal key={rol.nombre} delay={i * 100}>
                <Card className="h-full hover:shadow-float hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-700 mb-4">
                    <rol.Icono className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-ink-900 mb-2">{rol.nombre}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{rol.descripcion}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-50 to-accent-100 border border-accent-200 px-6 py-10 sm:px-14 sm:py-16">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#053686 1.5px, transparent 1.5px)',
                backgroundSize: '18px 18px',
                maskImage: 'radial-gradient(circle at 85% 30%, black, transparent 60%)',
                WebkitMaskImage: 'radial-gradient(circle at 85% 30%, black, transparent 60%)',
              }}
              aria-hidden="true"
            />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-600/10 blur-3xl" aria-hidden="true" />

            <div className="relative flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
              <img src="/img/IAseñalandoderecha.svg" alt="" className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 animate-float" />
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-semibold text-ink-900 mb-3 tracking-tight">¿Listo para comenzar?</h2>
                <p className="text-ink-600 mb-6 max-w-md mx-auto sm:mx-0">
                  Crea tu cuenta, sube tus notas y haz seguimiento de tu solicitud de homologación en tiempo real.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <Button href="/register" variant="primary" size="lg">Comenzar ahora</Button>
                  <Button href="/login" variant="secondary" size="lg">Iniciar sesión</Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
