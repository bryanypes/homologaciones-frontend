import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ClipboardList, Gavel, ShieldCheck } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import StatTile from '../../components/ui/StatTile';

const ROLES = [
  { rol: 'estudiante', label: 'Estudiantes', icon: GraduationCap, tone: 'primary' },
  { rol: 'coordinador', label: 'Coordinadores', icon: ClipboardList, tone: 'accent' },
  { rol: 'vicerrector', label: 'Vicerrectores', icon: Gavel, tone: 'success' },
  { rol: 'admin', label: 'Administradores', icon: ShieldCheck, tone: 'primary' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { showError } = useFeedback();
  const [conteos, setConteos] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const resultados = await Promise.all(
          ROLES.map(({ rol }) => client.get('/usuarios/', { params: { rol, size: 1 } }))
        );
        const next = {};
        ROLES.forEach(({ rol }, i) => { next[rol] = resultados[i].data.total ?? 0; });
        setConteos(next);
      } catch {
        showError('No se pudieron cargar las estadísticas de usuarios.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader title="Panel administrativo" />

        <button
          onClick={() => navigate('/admin/usuarios')}
          className="w-full sm:w-auto bg-white rounded-2xl border border-ink-100 shadow-card px-6 py-6 text-left hover:shadow-float hover:border-primary-200 transition-all group mb-8"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 mb-3">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="font-semibold text-ink-900 group-hover:text-primary-700">Gestionar usuarios</p>
          <p className="text-xs text-ink-500 mt-0.5">Crear y administrar estudiantes, coordinadores, vicerrectores y administradores</p>
        </button>

        <Card>
          <CardHeader title="Usuarios por rol" />
          {!cargando && conteos && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ROLES.map(({ rol, label, icon, tone }) => (
                <StatTile key={rol} icon={icon} value={conteos[rol] ?? 0} label={label} tone={tone} />
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
