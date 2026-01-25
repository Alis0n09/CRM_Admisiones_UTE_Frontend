import { api } from "./api";

const base = "/usuario";

export interface Usuario {
  id_usuario: string;
  email: string;
  activo?: boolean;
  id_empleado?: string | null;
  id_cliente?: string | null;
  empleado?: { id_empleado: string; nombres: string; apellidos: string } | null;
  cliente?: { id_cliente: string; nombres: string; apellidos: string } | null;
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getUsuarios() {
  const { data } = await api.get(base);
  return getData<Usuario[]>(data);
}

export async function getUsuario(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Usuario>(data);
}

export async function createUsuarioEmpleado(idEmpleado: string, body: { email: string; password: string; rolesIds?: string[] }) {
  const { data } = await api.post(`${base}/empleado/${idEmpleado}`, body);
  return getData<Usuario>(data);
}

export async function createUsuarioCliente(idCliente: string, body: { email: string; password: string; rolesIds?: string[] }) {
  const { data } = await api.post(`${base}/cliente/${idCliente}`, body);
  return getData<Usuario>(data);
}

export async function updateUsuario(id: string, body: Partial<Usuario>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Usuario>(data);
}

export async function updateUsuarioParcial(id: string, body: Partial<Usuario>) {
  // Intentar usar PATCH para actualizaciones parciales (solo campos que cambian)
  try {
    const { data } = await api.patch(`${base}/${id}`, body);
    return getData<Usuario>(data);
  } catch (e) {
    // Si PATCH no está disponible, usar PUT
    const { data } = await api.put(`${base}/${id}`, body);
    return getData<Usuario>(data);
  }
}

export async function deleteUsuario(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Usuario>(data);
}
