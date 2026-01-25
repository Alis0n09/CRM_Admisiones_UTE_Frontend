import { api } from "./api";

const base = "/beca";

export interface Beca {
  id_beca: string;
  nombre_beca: string;
  tipo_beca: string;
  descripcion?: string;
  // TypeORM suele devolver DECIMAL como string
  porcentaje_cobertura: number | string;
  monto_maximo?: number | string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

type ApiSuccess<T> = { success: true; message: string; data: T };
type ApiError = { success: false; message: string; statusCode: number; error?: any };

function unwrap<T>(payload: any): T {
  // por si algún interceptor devuelve { data: ... } extra
  if (payload && typeof payload === "object" && "data" in payload && !("success" in payload)) {
    return unwrap<T>(payload.data);
  }
  // SuccessResponseDto del backend
  if (payload && typeof payload === "object" && payload.success === true && "data" in payload) {
    return payload.data as T;
  }
  // fallback
  return payload as T;
}

function toNumber(v: any): number | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function normalizeBeca(b: Beca): Beca {
  return {
    ...b,
    porcentaje_cobertura: toNumber((b as any).porcentaje_cobertura) ?? (b as any).porcentaje_cobertura,
    monto_maximo: (b as any).monto_maximo == null ? undefined : (toNumber((b as any).monto_maximo) ?? (b as any).monto_maximo),
  };
}

export async function getBecas(params?: { page?: number; limit?: number }) {
  const { data } = await api.get(base, { params });
  const pag = unwrap<Paginated<Beca> | ApiError>(data);

  // si vino error envuelto, lo devolvemos tal cual (axios normalmente lo lanza antes)
  if ((pag as any)?.success === false) return pag as any;

  const ok = pag as Paginated<Beca>;
  return { ...ok, items: (ok.items ?? []).map(normalizeBeca) };
}

export async function getBeca(id: string) {
  const { data } = await api.get(`${base}/${id}`);
  const beca = unwrap<Beca | ApiError>(data);
  if ((beca as any)?.success === false) return beca as any;
  return normalizeBeca(beca as Beca);
}

export async function createBeca(body: Partial<Beca>) {
  const { data } = await api.post(base, body);
  const beca = unwrap<Beca | ApiError>(data);
  if ((beca as any)?.success === false) return beca as any;
  return normalizeBeca(beca as Beca);
}

export async function updateBeca(id: string, body: Partial<Beca>) {
  const { data } = await api.put(`${base}/${id}`, body);
  const beca = unwrap<Beca | ApiError>(data);
  if ((beca as any)?.success === false) return beca as any;
  return normalizeBeca(beca as Beca);
}

export async function deleteBeca(id: string) {
  const { data } = await api.delete(`${base}/${id}`);
  return unwrap<any>(data);
}