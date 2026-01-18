import { api } from "./api";

const base = "/rol";

export interface Rol {
  id_rol: string;
  nombre: string;
}

function getData<T>(r: any): T {
  return r?.data ?? r;
}

export async function getRoles() {
  const { data } = await api.get(base);
  return getData<Rol[]>(data);
}

export async function getRol(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<Rol>(data);
}

export async function createRol(body: { nombre: string }) {
  const { data } = await api.post(base, body);
  return getData<Rol>(data);
}

export async function updateRol(id: string, body: { nombre: string }) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<Rol>(data);
}

export async function deleteRol(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return getData<Rol>(data);
}
