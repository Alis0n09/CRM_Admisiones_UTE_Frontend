import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (loading) return <div style={{ padding: 24, textAlign: "center" }}>Cargando...</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    const roles = user?.roles ?? [];
    const hasRole = allowedRoles.some((r) => roles.includes(r));
    if (!hasRole) {
      if (roles.includes("ADMIN")) return <Navigate to="/admin" replace />;
      if (roles.includes("ASESOR")) return <Navigate to="/asesor" replace />;
      if (roles.includes("ASPIRANTE")) return <Navigate to="/aspirante" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
