import { api } from "./api";

export interface LoginResponse {
  access_token: string;
  user?: { id_usuario: string; email: string; roles?: string[]; id_cliente?: string; id_empleado?: string };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function getProfile() {
  const { data } = await api.get<{ user: any; diagnostic?: any }>("/auth/me");
  return data;
}

/** Solicitar restablecimiento de contraseña por email. */
export async function requestPasswordReset(email: string) {
  const { data } = await api.post<{
    message?: string;
    devMode?: boolean;
    resetUrl?: string;
  }>("/auth/forgot-password", { email });
  return data;
}

/** Restablecer contraseña con token (enlace del correo). */
export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post<{ message?: string }>("/auth/reset-password", { token, password: newPassword });
  return data;
}
