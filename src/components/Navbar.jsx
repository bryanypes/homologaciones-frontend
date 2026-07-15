import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ROL_ETIQUETA = {
  estudiante: 'Estudiante',
  coordinador: 'Coordinador',
  rector: 'Rector',
};

const NAV_LINKS = {
  estudiante: [
    { label: 'Mis solicitudes', path: '/solicitudes' },
  ],
  coordinador: [
    { label: 'Solicitudes', path: '/coordinador/solicitudes' },
  ],
  rector: [
    { label: 'Solicitudes', path: '/rector/solicitudes' },
    { label: 'Usuarios', path: '/rector/usuarios' },
    { label: 'Panel admin', path: '/rector/admin' },
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
    <header className="bg-[#1F3864] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <span className="font-semibold text-sm md:text-base whitespace-nowrap">
          Homologaciones — Corporación Universitaria Autónoma del Cauca
        </span>

        {links.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {links.map(({ label, path }) => {
              const activo = location.pathname === path || location.pathname.startsWith(path + '/');
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    activo ? 'bg-white/20 font-medium' : 'hover:bg-white/10 text-blue-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/perfil')}
            className="text-right hidden sm:block hover:opacity-80 transition"
          >
            <p className="text-sm font-medium leading-tight">{nombre}</p>
            <p className="text-xs text-blue-200">{ROL_ETIQUETA[rol] || rol}</p>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-white text-[#1F3864] rounded font-medium hover:bg-blue-50 transition whitespace-nowrap"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
