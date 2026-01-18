import { api } from "./api";

const base = "/empleado";

export interface Empleado {
  id_empleado: string;
  nombres: string;
  apellidos: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  correo?: string;
  telefono?: string;
  departamento?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getEmpleados(params?: { page?: number; limit?: number; search?: string }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Empleado>>(data);
}

export async function getEmpleado(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Empleado>(data);
}

export async function createEmpleado(body: Partial<Empleado>) {
  const { data } = await api.post(base, body);
  return getData<Empleado>(data);
}

export async function updateEmpleado(id: string, body: Partial<Empleado>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Empleado>(data);
}

export async function deleteEmpleado(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Empleado>(data);
}
