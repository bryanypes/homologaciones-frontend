import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Home from '../pages/Home';
import Perfil from '../pages/Perfil';

import Login from '../pages/Login';
import Register from '../pages/Register';

import MisSolicitudes from '../pages/estudiante/MisSolicitudes';
import NuevaSolicitud from '../pages/estudiante/NuevaSolicitud';
import DetalleSolicitud from '../pages/estudiante/DetalleSolicitud';

import SolicitudesCoordinador from '../pages/coordinador/SolicitudesCoordinador';
import DetalleSolicitudCoordinador from '../pages/coordinador/DetalleSolicitudCoordinador';

import SolicitudesRector from '../pages/rector/SolicitudesRector';
import DetalleSolicitudRector from '../pages/rector/DetalleSolicitudRector';
import Usuarios from '../pages/rector/Usuarios';
import AdminPanel from '../pages/rector/AdminPanel';

function RutaProtegida({ children, rolRequerido }) {
  const { token, rol } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (rolRequerido && rol !== rolRequerido) {
    if (rol === 'estudiante') return <Navigate to="/solicitudes" replace />;
    if (rol === 'coordinador') return <Navigate to="/coordinador/solicitudes" replace />;
    if (rol === 'rector') return <Navigate to="/rector/solicitudes" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="/rector/solicitudes" element={
          <RutaProtegida rolRequerido="rector"><SolicitudesRector /></RutaProtegida>
        } />
        <Route path="/rector/solicitudes/:id" element={
          <RutaProtegida rolRequerido="rector"><DetalleSolicitudRector /></RutaProtegida>
        } />
        <Route path="/rector/usuarios" element={
          <RutaProtegida rolRequerido="rector"><Usuarios /></RutaProtegida>
        } />
        <Route path="/rector/admin" element={
          <RutaProtegida rolRequerido="rector"><AdminPanel /></RutaProtegida>
        } />

        <Route path="/perfil" element={
          <RutaProtegida><Perfil /></RutaProtegida>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}