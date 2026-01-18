import { api } from "./api";

const base = "/seguimiento";

export interface Seguimiento {
  id_seguimiento: string;
  id_cliente: string;
  fecha_contacto?: string;
  medio?: string;
  comentarios?: string;
  proximo_paso?: string;
  fecha_proximo_contacto?: string;
  cliente?: { id_cliente: string; nombres: string; apellidos: string };
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getSeguimientos(params?: { page?: number; limit?: number; id_cliente?: string }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Seguimiento>>(data);
}

export async function getSeguimiento(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Seguimiento>(data);
}

export async function createSeguimiento(body: { id_cliente: string; fecha_contacto?: string; medio?: string; comentarios?: string; proximo_paso?: string; fecha_proximo_contacto?: string }) {
  const { data } = await api.post(base, body);
  return getData<Seguimiento>(data);
}

export async function updateSeguimiento(id: string, body: Partial<Seguimiento>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Seguimiento>(data);
}

export async function deleteSeguimiento(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Seguimiento>(data);
}
