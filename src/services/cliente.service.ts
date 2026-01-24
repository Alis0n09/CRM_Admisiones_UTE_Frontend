import { api } from "./api";
import axios from "axios";

const base = "/cliente";

export interface Cliente {
  id_cliente: string;
  nombres: string;
  apellidos: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  correo?: string;
  telefono?: string;
  celular?: string;
  calle_principal?: string;
  calle_secundaria?: string;
  numero_casa?: string;
  nacionalidad?: string;
  genero?: string;
  estado_civil?: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
  origen: string;
  fecha_cliente?: string;
  estado?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number };
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getClientes(params?: { page?: number; limit?: number; search?: string }) {
  const { data } = await api.get(base, { params });
  return getData<Paginated<Cliente>>(data);
}

export async function getCliente(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Cliente>(data);
}

export async function createCliente(body: Partial<Cliente>) {
  const { data } = await api.post(base, body);
  return getData<Cliente>(data);
}

export async function updateCliente(id: string, body: Partial<Cliente>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Cliente>(data);
}

export async function deleteCliente(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Cliente>(data);
}

// Función pública para crear clientes desde formularios públicos (sin autenticación requerida)
export async function createClientePublico(body: Partial<Cliente>) {
  // Crear una instancia de axios sin el interceptor de autenticación ni redirección
  const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  });
  
  // No agregar interceptores que puedan interferir con peticiones públicas
  const { data } = await axiosPublic.post(base, body);
  return getData<Cliente>(data);
}
