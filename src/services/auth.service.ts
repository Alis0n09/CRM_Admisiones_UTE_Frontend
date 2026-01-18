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
