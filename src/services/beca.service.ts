import { api } from "./api";

const base = "/beca";

export interface Beca {
  id_beca: string;
  nombre_beca: string;
  tipo_beca: string;
  descripcion?: string;
  porcentaje_cobertura: number;
  monto_maximo?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getBecas(params?: { page?: number; limit?: number }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Beca>>(data);
}

export async function getBeca(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Beca>(data);
}

export async function createBeca(body: Partial<Beca>) {
  const { data } = await api.post(base, body);
  return getData<Beca>(data);
}

export async function updateBeca(id: string, body: Partial<Beca>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Beca>(data);
}

export async function deleteBeca(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Beca>(data);
}
