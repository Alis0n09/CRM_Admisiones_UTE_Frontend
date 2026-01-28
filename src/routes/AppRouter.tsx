import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import AsesorLayout from "../layouts/AsesorLayout";
import AspiranteLayout from "../layouts/AspiranteLayout";
import HomePage from "../pages/public/HomePage";
import BecasDetallePage from "../pages/public/BecasDetallePage";
import CarrerasDetallePage from "../pages/public/CarrerasDetallePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage";
import ResetPasswordPage from "../pages/public/ResetPasswordPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ClientesPage from "../pages/admin/ClientesPage";
import EmpleadosPage from "../pages/admin/EmpleadosPage";
import UsuariosPage from "../pages/admin/UsuariosPage";
import TareasPage from "../pages/admin/TareasPage";
import PostulacionesPage from "../pages/admin/PostulacionesPage";
import CarrerasPage from "../pages/admin/CarrerasPage";
import MatriculasPage from "../pages/admin/MatriculasPage";
import DocumentosPage from "../pages/admin/DocumentosPage";
import BecasPage from "../pages/admin/BecasPage";
import RolesPage from "../pages/admin/RolesPage";
import SeguimientosPage from "../pages/admin/SeguimientosPage";

import AsesorDashboard from "../pages/asesor/AsesorDashboard";
import AsesorClientesPage from "../pages/asesor/AsesorClientesPage";
import AsesorTareasPage from "../pages/asesor/AsesorTareasPage";
import AsesorPostulacionesPage from "../pages/asesor/AsesorPostulacionesPage";
import AsesorCarrerasPage from "../pages/asesor/AsesorCarrerasPage";
import AsesorDocumentosPage from "../pages/asesor/AsesorDocumentosPage";
import AsesorSeguimientosPage from "../pages/asesor/AsesorSeguimientosPage";
import AsesorEvaluacionesPage from "../pages/asesor/AsesorEvaluacionesPage";
import AsesorCalendarioPage from "../pages/asesor/AsesorCalendarioPage";

import AspiranteDashboard from "../pages/aspirante/AspiranteDashboard";
import AspirantePerfilPage from "../pages/aspirante/AspirantePerfilPage";
import AspirantePostulacionesPage from "../pages/aspirante/AspirantePostulacionesPage";
import AspiranteDocumentosPage from "../pages/aspirante/AspiranteDocumentosPage";
import AspiranteTareasPage from "../pages/aspirante/AspiranteTareasPage";
import AspiranteCarrerasPage from "../pages/aspirante/AspiranteCarrerasPage";
import AspiranteBecasPage from "../pages/aspirante/AspiranteBecasPage";
import AspiranteSeguimientosPage from "../pages/aspirante/AspiranteSeguimientosPage";
import ProcesoAdmisionPage from "../pages/aspirante/ProcesoAdmisionPage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/becas" element={<BecasDetallePage />} />
        <Route path="/carreras" element={<CarrerasDetallePage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="empleados" element={<EmpleadosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="tareas" element={<TareasPage />} />
        <Route path="postulaciones" element={<PostulacionesPage />} />
        <Route path="carreras" element={<CarrerasPage />} />
        <Route path="matriculas" element={<MatriculasPage />} />
        <Route path="documentos" element={<DocumentosPage />} />
        <Route path="becas" element={<BecasPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="seguimientos" element={<SeguimientosPage />} />
      </Route>

      {/* Asesor */}
      <Route path="/asesor" element={<ProtectedRoute allowedRoles={["ADMIN", "ASESOR"]}><AsesorLayout /></ProtectedRoute>}>
        <Route index element={<AsesorDashboard />} />
        <Route path="clientes" element={<AsesorClientesPage />} />
        <Route path="evaluaciones" element={<AsesorEvaluacionesPage />} />
        <Route path="calendario" element={<AsesorCalendarioPage />} />
        <Route path="tareas" element={<AsesorTareasPage />} />
        <Route path="postulaciones" element={<AsesorPostulacionesPage />} />
        <Route path="carreras" element={<AsesorCarrerasPage />} />
        <Route path="documentos" element={<AsesorDocumentosPage />} />
        <Route path="seguimientos" element={<AsesorSeguimientosPage />} />
      </Route>

      {/* Aspirante */}
      <Route path="/aspirante" element={<ProtectedRoute allowedRoles={["ADMIN", "ASPIRANTE"]}><AspiranteLayout /></ProtectedRoute>}>
        <Route index element={<ProcesoAdmisionPage />} />
        <Route path="solicitud" element={<ProcesoAdmisionPage />} />
        <Route path="formulario" element={<AspiranteDocumentosPage />} />
        <Route path="perfil" element={<AspirantePerfilPage />} />
        <Route path="postulaciones" element={<AspirantePostulacionesPage />} />
        <Route path="documentos" element={<AspiranteDocumentosPage />} />
        <Route path="tareas" element={<AspiranteTareasPage />} />
        <Route path="carreras" element={<AspiranteCarrerasPage />} />
        <Route path="becas" element={<AspiranteBecasPage />} />
        <Route path="seguimientos" element={<AspiranteSeguimientosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
