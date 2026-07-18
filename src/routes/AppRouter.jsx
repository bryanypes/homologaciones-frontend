import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/Home';
import Perfil from '../pages/Perfil';

import Login from '../pages/Login';
import Register from '../pages/Register';
import RecuperarContrasena from '../pages/RecuperarContrasena';
import RestablecerContrasena from '../pages/RestablecerContrasena';

import MisSolicitudes from '../pages/estudiante/MisSolicitudes';
import NuevaSolicitud from '../pages/estudiante/NuevaSolicitud';
import DetalleSolicitud from '../pages/estudiante/DetalleSolicitud';

import SolicitudesCoordinador from '../pages/coordinador/SolicitudesCoordinador';
import DetalleSolicitudCoordinador from '../pages/coordinador/DetalleSolicitudCoordinador';

import SolicitudesVicerrector from '../pages/vicerrector/SolicitudesVicerrector';
import DetalleSolicitudVicerrector from '../pages/vicerrector/DetalleSolicitudVicerrector';

import Usuarios from '../pages/admin/Usuarios';
import AdminPanel from '../pages/admin/AdminPanel';

const DESTINO_POR_ROL = {
  estudiante: '/solicitudes',
  coordinador: '/coordinador/solicitudes',
  vicerrector: '/vicerrector/solicitudes',
  admin: '/admin/panel',
};

const TITULOS = [
  { match: /^\/$/, title: 'Inicio' },
  { match: /^\/login$/, title: 'Iniciar sesión' },
  { match: /^\/register$/, title: 'Crear cuenta' },
  { match: /^\/recuperar-contrasena$/, title: 'Recuperar contraseña' },
  { match: /^\/restablecer-contrasena$/, title: 'Restablecer contraseña' },
  { match: /^\/solicitudes\/nueva$/, title: 'Nueva solicitud' },
  { match: /^\/solicitudes\/[^/]+$/, title: 'Detalle de solicitud' },
  { match: /^\/solicitudes$/, title: 'Mis solicitudes' },
  { match: /^\/coordinador\/solicitudes\/[^/]+$/, title: 'Detalle de solicitud — Coordinador' },
  { match: /^\/coordinador\/solicitudes$/, title: 'Solicitudes — Coordinador' },
  { match: /^\/vicerrector\/solicitudes\/[^/]+$/, title: 'Detalle de solicitud — Vicerrector' },
  { match: /^\/vicerrector\/solicitudes$/, title: 'Solicitudes — Vicerrector' },
  { match: /^\/admin\/panel$/, title: 'Panel administrativo' },
  { match: /^\/admin\/usuarios$/, title: 'Gestión de usuarios' },
  { match: /^\/perfil$/, title: 'Mi perfil' },
];

function RouteAnnouncer() {
  const location = useLocation();
  // Capturado una sola vez (el inicializador de useState no se re-ejecuta,
  // a diferencia de un efecto, así que es inmune al doble-invoke de StrictMode).
  const [claveInicial] = useState(() => location.key);

  useEffect(() => {
    const encontrado = TITULOS.find(({ match }) => match.test(location.pathname));
    document.title = encontrado ? `${encontrado.title} · HomologaIA` : 'HomologaIA — Homologaciones Académicas';

    // No robar el foco en la carga inicial: así el enlace "saltar al contenido"
    // sigue siendo la primera parada de tabulación para quien navega con teclado.
    if (location.key === claveInicial) return;

    const objetivo = document.getElementById('main-content') ?? document.getElementById('inicio');
    objetivo?.focus();
  }, [location.pathname, location.key, claveInicial]);

  return null;
}

function RutaProtegida({ children, rolRequerido }) {
  const { token, rol } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (rolRequerido && rol !== rolRequerido) {
    return <Navigate to={DESTINO_POR_ROL[rol] ?? '/login'} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteAnnouncer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

        <Route path="/solicitudes" element={
          <RutaProtegida rolRequerido="estudiante"><MisSolicitudes /></RutaProtegida>
        } />
        <Route path="/solicitudes/nueva" element={
          <RutaProtegida rolRequerido="estudiante"><NuevaSolicitud /></RutaProtegida>
        } />
        <Route path="/solicitudes/:id" element={
          <RutaProtegida rolRequerido="estudiante"><DetalleSolicitud /></RutaProtegida>
        } />

        <Route path="/coordinador/solicitudes" element={
          <RutaProtegida rolRequerido="coordinador"><SolicitudesCoordinador /></RutaProtegida>
        } />
        <Route path="/coordinador/solicitudes/:id" element={
          <RutaProtegida rolRequerido="coordinador"><DetalleSolicitudCoordinador /></RutaProtegida>
        } />

        <Route path="/vicerrector/solicitudes" element={
          <RutaProtegida rolRequerido="vicerrector"><SolicitudesVicerrector /></RutaProtegida>
        } />
        <Route path="/vicerrector/solicitudes/:id" element={
          <RutaProtegida rolRequerido="vicerrector"><DetalleSolicitudVicerrector /></RutaProtegida>
        } />

        <Route path="/admin/panel" element={
          <RutaProtegida rolRequerido="admin"><AdminPanel /></RutaProtegida>
        } />
        <Route path="/admin/usuarios" element={
          <RutaProtegida rolRequerido="admin"><Usuarios /></RutaProtegida>
        } />

        <Route path="/perfil" element={
          <RutaProtegida><Perfil /></RutaProtegida>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
