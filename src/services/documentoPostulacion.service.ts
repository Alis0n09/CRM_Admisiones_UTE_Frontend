import { api } from "./api";

const base = "/documentos-postulacion";

export interface DocumentoPostulacion {
  id_documento: string;
  id_postulacion: string;
  tipo_documento: string;
  nombre_archivo: string;
  url_archivo: string;
  estado_documento?: string;
  observaciones?: string;
  postulacion?: { id_postulacion: string; cliente?: { nombres: string; apellidos: string }; carrera?: { nombre_carrera: string } };
}

function getData<T>(r: any): T {
  if (Array.isArray(r)) return r as T;
  // Soportar respuestas paginadas tipo { items: [...], meta: {...} }
  if (Array.isArray(r?.items)) return r.items as T;
  // Soportar wrappers tipo { data: { items: [...] } }
  if (Array.isArray(r?.data?.items)) return r.data.items as T;
  return r?.data ?? r;
}

export async function getDocumentosPostulacion() {
  const { data } = await api.get(base);
  return getData<DocumentoPostulacion[]>(data);
}

export async function getDocumentosPorPostulacion(id_postulacion: string) {
  const { data } = await api.get(`${base}/por-postulacion/${id_postulacion}`);
  return getData<DocumentoPostulacion[]>(data);
}

export async function getDocumentoPostulacion(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  return getData<DocumentoPostulacion>(data);
}

export async function createDocumentoPostulacion(body: { 
  id_postulacion: string; 
  tipo_documento: string; 
  nombre_archivo: string; 
  url_archivo: string; 
  estado_documento?: string; 
  observaciones?: string 
}) {
  // Enviar exactamente como en Postman: POST /documentos-postulacion con JSON body
  const { data } = await api.post(base, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return getData<DocumentoPostulacion>(data);
}

export async function updateDocumentoPostulacion(id: string, body: Partial<DocumentoPostulacion>) {
  const { data } = await api.put(`${base}/${id}`, body);
  return getData<DocumentoPostulacion>(data);
}

export async function deleteDocumentoPostulacion(id: string) {
  await api.delete(`${base}/${id}`);
}
