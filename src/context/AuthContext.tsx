import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth.service";

interface User {
  id_usuario: string;
  email: string;
  roles?: string[];
  id_cliente?: string;
  id_empleado?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isAsesor: boolean;
  isAspirante: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  const isAsesor = roles.includes("ASESOR");
  const isAspirante = roles.includes("ASPIRANTE");

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authService.login(email, password);
    localStorage.setItem("token", res.access_token);
    const u = res.user ?? { id_usuario: "", email, roles: [] as string[] };
    setUser({ ...u, id_cliente: (res as any).id_cliente ?? u.id_cliente, id_empleado: (res as any).id_empleado ?? u.id_empleado } as User);
    localStorage.setItem("user", JSON.stringify(u));
    try {
      const { user: profile } = await authService.getProfile();
      const pro = profile as any;
      const r = pro?.roles ?? u.roles ?? [];
      const us: User = { id_usuario: pro?.id_usuario ?? u.id_usuario, email: pro?.email ?? email, roles: r, id_cliente: pro?.id_cliente, id_empleado: pro?.id_empleado };
      setUser(us);
      localStorage.setItem("user", JSON.stringify(us));
      return us;
    } catch {
      return { ...u, id_usuario: (u as any).id_usuario, email, roles: (u as any).roles ?? [] } as User;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setLoading(false);
      return;
    }
    authService
      .getProfile()
      .then(({ user: profile }) => {
        const p = profile as any;
        setUser({
          id_usuario: p?.id_usuario ?? (p?.id ?? ""),
          email: p?.email ?? "",
          roles: p?.roles ?? [],
          id_cliente: p?.id_cliente,
          id_empleado: p?.id_empleado,
        } as User);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    if (!loading || user) return;
    const u = localStorage.getItem("user");
    if (u) try { setUser(JSON.parse(u)); } catch (_) {}
  }, [loading, user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAsesor, isAspirante }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}