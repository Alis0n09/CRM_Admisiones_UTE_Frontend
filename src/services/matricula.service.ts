import { api } from "./api";

const base = "/matricula";

export interface Matricula {
  id_matricula: string;
  id_cliente: string;
  id_carrera: string;
  fecha_matricula?: string;
  periodo_academico: string;
  estado?: string;
  cliente?: { id_cliente: string; nombres: string; apellidos: string };
  carrera?: { id_carrera: string; nombre_carrera: string };
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getMatriculas(params?: { page?: number; limit?: number }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Matricula>>(data);
}

export async function getMatricula(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Matricula>(data);
}

export async function createMatricula(body: { id_cliente: string; id_carrera: string; periodo_academico: string; fecha_matricula?: string; estado?: string }) {
  const { data } = await api.post(base, body);
  return getData<Matricula>(data);
}

export async function updateMatricula(id: string, body: Partial<Matricula>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Matricula>(data);
}

export async function deleteMatricula(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Matricula>(data);
}
