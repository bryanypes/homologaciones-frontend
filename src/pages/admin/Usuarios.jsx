import { useEffect, useState } from 'react';
import { Plus, Pencil, Power, Trash2 } from 'lucide-react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import { useFeedback } from '../../context/FeedbackContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Input, Select } from '../../components/ui/Field';

const ROLES = ['estudiante', 'coordinador', 'vicerrector', 'admin'];

const FORM_VACIO = { nombre: '', apellido: '', email: '', password: '', rol: 'coordinador' };
const EDIT_VACIO = { nombre: '', apellido: '', rol: 'coordinador' };

export default function Usuarios() {
  const { showError, showSuccess } = useFeedback();
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);

  const [modalCrear, setModalCrear] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  const [modalEditar, setModalEditar] = useState(null);
  const [editForm, setEditForm] = useState(EDIT_VACIO);
  const [editando, setEditando] = useState(false);

  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const POR_PAGINA = 10;

  const cargar = async (pag = 1) => {
    setCargando(true);
    try {
      const params = { page: pag, size: POR_PAGINA };
      if (filtroRol) params.rol = filtroRol;
      const { data } = await client.get('/usuarios/', { params });
      setUsuarios(data.items ?? data);
      setTotal(data.total ?? (data.items ?? data).length);
      setPagina(pag);
    } catch {
      showError('No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(1); }, [filtroRol]);

  const handleToggleActivo = async (usuario) => {
    try {
      await client.patch(`/usuarios/${usuario.id}`, { activo: !usuario.activo });
      showSuccess(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente.`);
      cargar(pagina);
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al cambiar estado.');
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await client.post('/usuarios/', form);
      showSuccess('Usuario creado correctamente.');
      setModalCrear(false);
      setForm(FORM_VACIO);
      cargar(1);
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al crear el usuario.');
    } finally {
      setCreando(false);
    }
  };

  const abrirEditar = (usuario) => {
    setModalEditar(usuario);
    setEditForm({ nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol });
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setEditando(true);
    try {
      await client.patch(`/usuarios/${modalEditar.id}`, editForm);
      showSuccess('Usuario actualizado correctamente.');
      setModalEditar(null);
      cargar(pagina);
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al editar el usuario.');
    } finally {
      setEditando(false);
    }
  };

  const confirmarEliminarUsuario = async () => {
    const usuario = confirmarEliminar;
    if (!usuario) return;
    setEliminando(usuario.id);
    try {
      await client.delete(`/usuarios/${usuario.id}`);
      showSuccess('Usuario eliminado correctamente.');
      cargar(pagina);
    } catch (err) {
      showError(err.response?.data?.detail || 'No se pudo eliminar el usuario.');
    } finally {
      setEliminando(null);
      setConfirmarEliminar(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHeader
          title="Gestión de usuarios"
          action={
            <Button onClick={() => setModalCrear(true)}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Crear usuario
            </Button>
          }
        />

        <div className="flex gap-3 mb-6">
          <Select className="min-w-[180px]" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </Select>
        </div>

        {cargando ? (
          <SkeletonTable rows={5} cols={6} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-card">
              <table className="min-w-full divide-y divide-ink-100 text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Creado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-0">
                        <EmptyState title="No hay usuarios." />
                      </td>
                    </tr>
                  ) : usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-ink-700">{u.nombre} {u.apellido}</td>
                      <td className="px-4 py-3.5 text-ink-700">{u.email}</td>
                      <td className="px-4 py-3.5 text-ink-700 capitalize">{u.rol}</td>
                      <td className="px-4 py-3.5">
                        <Badge tone={u.activo ? 'success' : 'neutral'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                      </td>
                      <td className="px-4 py-3.5 text-ink-500">
                        {u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="secondary" onClick={() => abrirEditar(u)}>
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            Editar
                          </Button>
                          <Button size="sm" variant={u.activo ? 'accent' : 'success'} onClick={() => handleToggleActivo(u)}>
                            <Power className="w-3.5 h-3.5" aria-hidden="true" />
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setConfirmarEliminar(u)} loading={eliminando === u.id}>
                            {!(eliminando === u.id) && <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagina={pagina} total={total} porPagina={POR_PAGINA} onPageChange={cargar} />
          </>
        )}
      </main>

      {/* Modal crear */}
      <Modal open={modalCrear} onClose={() => setModalCrear(false)} title="Crear usuario">
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <Select label="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </Select>
          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalCrear(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={creando}>
              {creando ? 'Creando...' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal editar */}
      <Modal open={!!modalEditar} onClose={() => setModalEditar(null)} title="Editar usuario">
        {modalEditar && (
          <>
            <p className="text-xs text-ink-500 -mt-3 mb-4">{modalEditar.email}</p>
            <form onSubmit={handleEditar} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Nombre" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required />
                <Input label="Apellido" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} required />
              </div>
              <Select label="Rol" value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </Select>
              <div className="flex gap-3 mt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalEditar(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" loading={editando}>
                  {editando ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Modal>

      {/* Confirmar eliminar */}
      <ConfirmModal
        open={!!confirmarEliminar}
        title="Eliminar usuario"
        message={confirmarEliminar ? `¿Eliminar al usuario ${confirmarEliminar.nombre} ${confirmarEliminar.apellido}? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        loading={eliminando === confirmarEliminar?.id}
        onConfirm={confirmarEliminarUsuario}
        onCancel={() => setConfirmarEliminar(null)}
      />
    </div>
  );
}
