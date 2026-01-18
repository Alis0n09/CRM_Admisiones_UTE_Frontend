import { api } from "./api";

const base = "/carrera";

export interface Carrera {
  id_carrera: string;
  nombre_carrera: string;
  facultad: string;
  duracion_semestres: number;
  nivel_grado: string;
  cupos_disponibles: number;
  estado?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getCarreras(params?: { page?: number; limit?: number; search?: string }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Carrera>>(data);
}

export async function getCarrera(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Carrera>(data);
}

export async function createCarrera(body: Partial<Carrera>) {
  const { data } = await api.post(base, body);
  return getData<Carrera>(data);
}

export async function updateCarrera(id: string, body: Partial<Carrera>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Carrera>(data);
}

export async function deleteCarrera(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Carrera>(data);
}
