import { User, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/cn';

const ROL_ETIQUETA = {
  estudiante: 'Estudiante',
  coordinador: 'Coordinador',
  vicerrector: 'Vicerrector',
  admin: 'Administrador',
};

const NAV_LINKS = {
  estudiante: [
    { label: 'Mis solicitudes', path: '/solicitudes' },
  ],
  coordinador: [
    { label: 'Solicitudes', path: '/coordinador/solicitudes' },
  ],
  vicerrector: [
    { label: 'Solicitudes', path: '/vicerrector/solicitudes' },
  ],
  admin: [
    { label: 'Panel', path: '/admin/panel' },
    { label: 'Usuarios', path: '/admin/usuarios' },
  ],
};

export default function Navbar() {
  const { nombre, rol, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = NAV_LINKS[rol] ?? [];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-primary-700 focus:px-4 focus:py-2.5 focus:rounded-lg focus:shadow-float-lg focus:font-medium"
      >
        Saltar al contenido principal
      </a>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <img src="/img/LOGO.svg" alt="HomologaIA" className="h-9 w-auto rounded-md" />
          <span className="hidden sm:block font-semibold text-ink-900 text-sm tracking-tight">HomologaIA</span>
        </button>

        {links.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {links.map(({ label, path }) => {
              const activo = location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    activo ? 'bg-primary-600 text-white' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/perfil')}
            aria-label={`Mi perfil, ${nombre}`}
            title="Ver mi perfil"
            className={cn(
              'flex items-center gap-2 sm:gap-2.5 rounded-full sm:rounded-xl transition-colors min-h-11',
              'border border-ink-200 bg-white pl-1 pr-3 sm:pr-2.5 py-1',
              'hover:bg-ink-50 hover:border-ink-300',
              location.pathname === '/perfil' && 'bg-primary-50 border-primary-200',
            )}
          >
            <span className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
              <User className="w-4.5 h-4.5" aria-hidden="true" />
            </span>
            <span className="sm:hidden text-sm font-semibold text-ink-800">Mi perfil</span>
            <span className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight text-ink-900">{nombre}</p>
              <p className="text-xs text-ink-500">{ROL_ETIQUETA[rol] || rol}</p>
            </span>
            <ChevronRight className="hidden sm:block w-4 h-4 text-ink-300 shrink-0" aria-hidden="true" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-sm bg-white border border-ink-200 text-ink-700 rounded-xl font-medium hover:bg-ink-50 hover:border-ink-300 transition-colors whitespace-nowrap"
          >
            Salir
          </button>
        </div>
      </div>

      {links.length > 0 && (
        <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {links.map(({ label, path }) => {
            const activo = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  activo ? 'bg-primary-600 text-white' : 'text-ink-600 bg-ink-100',
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
    </>
  );
}
