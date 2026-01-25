import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DataTable, { type Column } from "../../components/DataTable";
import * as postulacionService from "../../services/postulacion.service";
import * as documentoService from "../../services/documentoPostulacion.service";
import * as clienteService from "../../services/cliente.service";
import type { Postulacion } from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { Cliente } from "../../services/cliente.service";
import { useAuth } from "../../context/AuthContext";

const cols: Column<Postulacion>[] = [
  { id: "carrera", label: "Carrera", minWidth: 200, format: (_, r) => r.carrera?.nombre_carrera ?? "-" },
  { id: "periodo_academico", label: "Período", minWidth: 100 },
  { id: "fecha_postulacion", label: "Fecha", minWidth: 100 },
  { id: "estado_postulacion", label: "Estado", minWidth: 110 },
];

export default function AspirantePostulacionesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Postulacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [postulacionActiva, setPostulacionActiva] = useState<Postulacion | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoPostulacion[]>([]);

  const normalizeKey = (v: unknown) => {
    const s = String(v ?? "").trim().toLowerCase();
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const tipoAliases: Record<string, string> = {
    "cedula": "cedula de identidad",
    "cedula de identidad": "cedula de identidad",
    "documento de identidad": "cedula de identidad",
    "acta": "acta de grado",
    "acta de grado": "acta de grado",
    "titulo": "titulo de bachiller",
    "titulo de bachiller": "titulo de bachiller",
    "foto": "foto tamano carnet",
    "foto tamano carnet": "foto tamano carnet",
    "foto tamaño carnet": "foto tamano carnet",
  };

  const tipoKey = (v: unknown) => {
    const k = normalizeKey(v);
    return tipoAliases[k] ?? k;
  };

  const getPostulacionClienteId = (p: Partial<Postulacion> | null | undefined) => {
    const anyP = p as any;
    return String(anyP?.id_cliente ?? anyP?.cliente?.id_cliente ?? "").trim();
  };

  const getDocPostulacionId = (d: Partial<DocumentoPostulacion> | null | undefined) => {
    const anyD = d as any;
    return String(anyD?.id_postulacion ?? anyD?.postulacion?.id_postulacion ?? "").trim();
  };

  const load = useCallback(async () => {
    try {
      const [postulacionesRes, docsRes, clienteRes] = await Promise.all([
        postulacionService.getPostulaciones({ page, limit }).catch(() => [] as any),
        documentoService.getDocumentosPostulacion().catch(() => [] as any),
        user?.id_cliente ? clienteService.getCliente(user.id_cliente).catch(() => null as any) : Promise.resolve(null as any),
      ]);

      const list: Postulacion[] = (postulacionesRes as any)?.items ?? (Array.isArray(postulacionesRes) ? postulacionesRes : []);
      setItems(list);
      setTotal((postulacionesRes as any)?.meta?.totalItems ?? list.length);
      setCliente(clienteRes || null);

      const docsList: DocumentoPostulacion[] = Array.isArray(docsRes) ? docsRes : [];

      // Activa: la más reciente del cliente
      const userClienteId = String(user?.id_cliente ?? "").trim();
      const postulacionesCliente = userClienteId
        ? list.filter((p) => getPostulacionClienteId(p) === userClienteId)
        : list;

      const activa = postulacionesCliente.length > 0
        ? [...postulacionesCliente].sort((a, b) => {
            const fa = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
            const fb = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
            return fb - fa;
          })[0]
        : list[0] ?? null;

      setPostulacionActiva(activa || null);

      const idPost = String(activa?.id_postulacion || "").trim();
      const docsPost = idPost ? docsList.filter((d) => getDocPostulacionId(d) === idPost) : [];
      setDocumentos(docsPost);
    } catch {
      setItems([]);
      setTotal(0);
      setCliente(null);
      setPostulacionActiva(null);
      setDocumentos([]);
    }
  }, [page, limit, user?.id_cliente]);

  useEffect(() => {
    void load();
  }, [load]);

  const documentosRequeridos = useMemo(() => {
    if (!postulacionActiva) return [];

    const requeridosEstandar = [
      "Cédula de identidad",
      "Acta de grado",
      "Título de bachiller",
      "Foto tamaño carnet",
    ];

    const tiposExistentes = documentos.map((d) => d.tipo_documento);
    const todosTipos = tiposExistentes.length > 0
      ? [...new Set([...tiposExistentes, ...requeridosEstandar])]
      : requeridosEstandar;

    return todosTipos.map((tipo) => {
      const docExistente = documentos.find((d) => tipoKey(d.tipo_documento) === tipoKey(tipo)) || null;
      const urlOk = !!docExistente?.url_archivo && String(docExistente.url_archivo).trim() !== "";
      return { tipo_documento: tipo, existe: !!docExistente && urlOk, documento: docExistente };
    });
  }, [postulacionActiva, documentos]);

  const docsProgreso = useMemo(() => {
    const totalDocs = documentosRequeridos.length || 4;
    const cargados = documentosRequeridos.filter((d) => d.existe && !!d.documento?.url_archivo).length;
    const porcentaje = totalDocs > 0 ? Math.round((cargados / totalDocs) * 100) : 0;
    return { cargados, total: totalDocs, porcentaje };
  }, [documentosRequeridos]);

  const overallProgress = useMemo(() => {
    // 5 pasos como en el ejemplo (registro, formulario, documentos, entrevista, resultado)
    const steps = 5;
    const registroOk = !!cliente || !!user?.id_cliente;
    const formularioOk = !!postulacionActiva;
    const documentosOk = docsProgreso.total > 0 && docsProgreso.cargados >= docsProgreso.total;

    // inferir por estado
    const estado = String(postulacionActiva?.estado_postulacion || "").toLowerCase();
    const hasFinal = /(aprob|rechaz|admit|no admit|finaliz|cancel)/i.test(estado);
    const hasInterviewDone = /(entrevista).*(realiz|complet|finaliz)/i.test(estado);

    const completed =
      (registroOk ? 1 : 0) +
      (formularioOk ? 1 : 0) +
      (documentosOk ? 1 : 0) +
      (documentosOk && hasInterviewDone ? 1 : 0) +
      (documentosOk && hasInterviewDone && hasFinal ? 1 : 0);

    return Math.round((completed / steps) * 100);
  }, [cliente, user?.id_cliente, postulacionActiva, docsProgreso]);

  const currentStepNumber = useMemo(() => {
    // Aproximación simple: 1=registro, 2=formulario, 3=documentos, 4=entrevista, 5=resultado
    if (!postulacionActiva) return 1;
    if (docsProgreso.cargados < docsProgreso.total) return 3;
    const estado = String(postulacionActiva?.estado_postulacion || "").toLowerCase();
    const hasInterviewDone = /(entrevista).*(realiz|complet|finaliz)/i.test(estado);
    const hasFinal = /(aprob|rechaz|admit|no admit|finaliz|cancel)/i.test(estado);
    if (!hasInterviewDone) return 4;
    if (!hasFinal) return 5;
    return 5;
  }, [postulacionActiva, docsProgreso]);

  const estadoActual = useMemo(() => {
    if (!postulacionActiva) return "Sin postulación";
    if (docsProgreso.cargados < docsProgreso.total) return "Revisión de documentos";
    return postulacionActiva.estado_postulacion || "En proceso";
  }, [postulacionActiva, docsProgreso]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Tarjeta de progreso (alineada al ejemplo) */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, overflow: "hidden" }}>
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)",
            width: "100%",
          }}
        />
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1.25 }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Estado de tu solicitud
                </Typography>
                <Chip
                  label="Activo"
                  size="small"
                  sx={{
                    height: 22,
                    fontWeight: 700,
                    bgcolor: "#e0f2fe",
                    color: "#2563eb",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                <AccessTimeIcon sx={{ color: "#94a3b8", fontSize: 18, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: "#64748b" }} noWrap>
                  {estadoActual}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  color: "#7c3aed",
                  lineHeight: 1,
                  fontSize: { xs: 38, sm: 48 },
                }}
              >
                {overallProgress}
                <Box component="span" sx={{ fontSize: 18, fontWeight: 800, color: "#94a3b8", ml: 0.5 }}>
                  %
                </Box>
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                <TrendingUpIcon sx={{ color: "#22c55e", fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                  Completado
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ height: 10, borderRadius: 999, bgcolor: "#d1fae5", overflow: "hidden", mb: 1.25 }}>
            <Box
              sx={{
                height: "100%",
                width: `${overallProgress}%`,
                borderRadius: 999,
                background: "linear-gradient(90deg, #7c3aed 0%, #22c55e 100%)",
                transition: "width 0.3s ease",
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  bgcolor: "#7c3aed",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                {currentStepNumber}
              </Box>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Paso{" "}
                <Box component="span" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  {currentStepNumber}
                </Box>{" "}
                de 5
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const active = i < currentStepNumber;
                return (
                  <Box
                    key={i}
                    sx={{
                      width: active ? 22 : 6,
                      height: 6,
                      borderRadius: active ? 999 : "50%",
                      bgcolor: active ? "#7c3aed" : "#e5e7eb",
                      transition: "all 0.2s ease",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <DataTable
        title="Mis postulaciones"
        columns={cols}
        rows={items}
        total={total}
        page={page}
        rowsPerPage={limit}
        onPageChange={setPage}
        onRowsPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        getId={(r) => r.id_postulacion}
      />
    </Box>
  );
}
