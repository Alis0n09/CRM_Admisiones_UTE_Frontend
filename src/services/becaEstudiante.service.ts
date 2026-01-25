import { api } from "./api";

const base = "/becas-estudiantes";

export interface BecaEstudiante {
  id_beca_estudiante: string;
  id_beca: string;
  id_cliente: string;
  periodo_academico: string;
  monto_otorgado: string;
  fecha_asignacion?: string;
  estado: string;
  beca?: {
    id_beca: string;
    nombre_beca: string;
    tipo_beca: string;
    descripcion?: string;
    porcentaje_cobertura: number;
    monto_maximo?: number;
    estado?: string;
  };
  cliente?: {
    id_cliente: string;
    nombres: string;
    apellidos: string;
  };
}

export interface CreateBecaEstudianteDto {
  id_beca: string;
  id_cliente: string;
  periodo_academico: string;
  monto_otorgado: string;
  fecha_asignacion?: string;
  estado?: string;
}

export interface UpdateBecaEstudianteDto {
  id_beca?: string;
  id_cliente?: string;
  periodo_academico?: string;
  monto_otorgado?: string;
  fecha_asignacion?: string;
  estado?: string;
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getBecasEstudiantes() {
  const { data } = await api.get(base);
  return getData<BecaEstudiante[]>(data);
}

export async function getBecaEstudiante(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<BecaEstudiante>(data);
}

export async function getBecasEstudiantesByCliente(id_cliente: string) {
  const { data } = await api.get(base);
  const allBecas = getData<BecaEstudiante[]>(data);
  // Filtrar por cliente en el frontend
  // El backend devuelve todas las becas para ADMIN/ASESOR, así que filtramos aquí
  return allBecas.filter((be: BecaEstudiante) => {
    const clienteId = be.id_cliente || be.cliente?.id_cliente;
    return clienteId === id_cliente;
  });
}

export async function createBecaEstudiante(body: CreateBecaEstudianteDto) {
  const { data } = await api.post(base, body);
  return getData<BecaEstudiante>(data);
}

export async function updateBecaEstudiante(id: string, body: UpdateBecaEstudianteDto) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<BecaEstudiante>(data);
}

export async function deleteBecaEstudiante(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<BecaEstudiante>(data);
}
