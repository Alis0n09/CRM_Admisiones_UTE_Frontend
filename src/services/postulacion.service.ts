import { api } from "./api";

const base = "/postulacion";

export interface Postulacion {
  id_postulacion: string;
  id_cliente: string;
  id_carrera: string;
  periodo_academico: string;
  fecha_postulacion?: string;
  estado_postulacion?: string;
  observaciones?: string;
  cliente?: { id_cliente: string; nombres: string; apellidos: string };
  carrera?: { id_carrera: string; nombre_carrera: string };
}

export interface Paginated<T> {
  items: T[];
  meta?: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export type GetPostulacionesParams = {
  page?: number;
  limit?: number;
  /** Filtra por cliente. El backend debe soportar GET /postulacion?id_cliente=xxx */
  id_cliente?: string;
};

export async function getPostulaciones(params?: GetPostulacionesParams) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Postulacion> | Postulacion[]>(data);
}

export async function getPostulacion(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Postulacion>(data);
}

export async function createPostulacion(body: { id_cliente: string; id_carrera: string; periodo_academico: string; estado_postulacion?: string; observaciones?: string }) {
  const { data } = await api.post(base, body);
  return getData<Postulacion>(data);
}

export async function updatePostulacion(id: string, body: Partial<Postulacion>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Postulacion>(data);
}

export async function deletePostulacion(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  // El backend devuelve SuccessResponseDto, extraer los datos correctamente
  const response = getData<any>(data);
  // Si la respuesta tiene una estructura { message, data }, devolver data
  // Si no, devolver la respuesta completa
  return response?.data || response;
}
