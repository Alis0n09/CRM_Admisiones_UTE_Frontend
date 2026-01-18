import { api } from "./api";

const base = "/tareas";

export interface TareaCrm {
  id_tarea: string;
  id_empleado?: string;
  id_cliente?: string;
  descripcion?: string;
  fecha_asignacion?: string;
  fecha_vencimiento?: string;
  estado?: string;
  empleado?: { id_empleado: string; nombres: string; apellidos: string };
  cliente?: { id_cliente: string; nombres: string; apellidos: string };
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getTareas(params?: { page?: number; limit?: number; id_empleado?: string; id_cliente?: string }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<TareaCrm>>(data);
}

export async function getTarea(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<TareaCrm>(data);
}

export async function createTarea(body: { id_empleado: string; id_cliente: string; descripcion?: string; fecha_asignacion?: string; fecha_vencimiento?: string; estado?: string }) {
  const { data } = await api.post(base, body);
  return getData<TareaCrm>(data);
}

export async function updateTarea(id: string, body: Partial<TareaCrm>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<TareaCrm>(data);
}

export async function deleteTarea(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<TareaCrm>(data);
}
