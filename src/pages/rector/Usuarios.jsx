import { useEffect, useState } from 'react';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import Spinner from '../../components/Spinner';

const ROLES = ['estudiante', 'coordinador', 'rector'];

const FORM_VACIO = { nombre: '', apellido: '', email: '', password: '', rol: 'coordinador' };
const EDIT_VACIO = { nombre: '', apellido: '', rol: 'coordinador' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtroRol, setFiltroRol] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Modal crear
  const [modalCrear, setModalCrear] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  // Modal editar
  const [modalEditar, setModalEditar] = useState(null); // usuario a editar
  const [editForm, setEditForm] = useState(EDIT_VACIO);
  const [editando, setEditando] = useState(false);

  // Eliminar
  const [eliminando, setEliminando] = useState(null); // id del usuario siendo eliminado

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
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(1); }, [filtroRol]);

  const limpiarMensajes = () => { setError(null); setExito(null); };

  const handleToggleActivo = async (usuario) => {
    limpiarMensajes();
    try {
      await client.patch(`/usuarios/${usuario.id}`, { activo: !usuario.activo });
      setExito(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente.`);
      cargar(pagina);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cambiar estado.');
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    limpiarMensajes();
    try {
      await client.post('/usuarios/', form);
      setExito('Usuario creado correctamente.');
      setModalCrear(false);
      setForm(FORM_VACIO);
      cargar(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear el usuario.');
    } finally {
      setCreando(false);
    }
  };

  const abrirEditar = (usuario) => {
    setModalEditar(usuario);
    setEditForm({ nombre: usuario.nombre, apellido: usuario.apellido, rol: usuario.rol });
    limpiarMensajes();
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setEditando(true);
    limpiarMensajes();
    try {
      await client.patch(`/usuarios/${modalEditar.id}`, editForm);
      setExito('Usuario actualizado correctamente.');
      setModalEditar(null);
      cargar(pagina);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al editar el usuario.');
    } finally {
      setEditando(false);
    }
  };

  const handleEliminar = async (usuario) => {
    if (!window.confirm(`¿Eliminar al usuario ${usuario.nombre} ${usuario.apellido}? Esta acción no se puede deshacer.`)) return;
    setEliminando(usuario.id);
    limpiarMensajes();
    try {
      await client.delete(`/usuarios/${usuario.id}`);
      setExito('Usuario eliminado correctamente.');
      cargar(pagina);
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo eliminar el usuario.');
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Gestión de usuarios</h1>
          <button
            onClick={() => { setModalCrear(true); limpiarMensajes(); }}
            className="px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 transition"
          >
            + Crear usuario
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">{error}</div>
        )}
        {exito && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{exito}</div>
        )}

        <div className="flex gap-3 mb-6">
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>

        {cargando ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay usuarios.</td>
                    </tr>
                  ) : usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{u.nombre} {u.apellido}</td>
                      <td className="px-4 py-3 text-gray-700">{u.email}</td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{u.rol}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => abrirEditar(u)}
                            className="px-3 py-1 text-xs rounded-md font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActivo(u)}
                            className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                              u.activo ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleEliminar(u)}
                            disabled={eliminando === u.id}
                            className="px-3 py-1 text-xs rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition"
                          >
                            {eliminando === u.id ? '...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > POR_PAGINA && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Página {pagina} de {Math.ceil(total / POR_PAGINA)} — {total} registros</span>
                <div className="flex gap-2">
                  <button onClick={() => cargar(pagina - 1)} disabled={pagina <= 1} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    Anterior
                  </button>
                  <button onClick={() => cargar(pagina + 1)} disabled={pagina >= Math.ceil(total / POR_PAGINA)} className="px-3 py-1 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal crear */}
      {modalCrear && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Crear usuario</h2>
              <button onClick={() => setModalCrear(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleCrear} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setModalCrear(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={creando}
                  className="flex-1 px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50">
                  {creando ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Editar usuario</h2>
              <button onClick={() => setModalEditar(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">{modalEditar.email}</p>
            <form onSubmit={handleEditar} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={editForm.rol} onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setModalEditar(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={editando}
                  className="flex-1 px-4 py-2 bg-[#1F3864] text-white text-sm rounded-md hover:bg-blue-900 disabled:opacity-50">
                  {editando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
