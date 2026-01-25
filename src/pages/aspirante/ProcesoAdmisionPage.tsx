import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as clienteService from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";
import * as documentoService from "../../services/documentoPostulacion.service";
import type { Cliente } from "../../services/cliente.service";
import type { Postulacion } from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";

interface StepData {
  label: string;
  date?: string;
  status: "completed" | "in-progress" | "pending";
  description?: string;
}

export default function ProcesoAdmisionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
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

  const loadData = useCallback(async () => {
    if (!user?.id_cliente) {
      setLoading(false);
      return;
    }

    try {
      const [clienteRes, postulacionesRes, docsRes] = await Promise.all([
        clienteService.getCliente(user.id_cliente).catch(() => null as any),
        postulacionService.getPostulaciones().catch(() => [] as any),
        documentoService.getDocumentosPostulacion().catch(() => [] as any),
      ]);

      setCliente(clienteRes || null);

      const postulacionesList: Postulacion[] = Array.isArray(postulacionesRes)
        ? postulacionesRes
        : (postulacionesRes as any)?.items || [];

      const docsList: DocumentoPostulacion[] = Array.isArray(docsRes) ? docsRes : [];

      const userClienteId = String(user.id_cliente).trim();
      const postulacionesCliente = postulacionesList.filter(
        (p: Postulacion) => getPostulacionClienteId(p) === userClienteId
      );

      const postulacionActiva = postulacionesCliente.length > 0
        ? [...postulacionesCliente].sort((a: Postulacion, b: Postulacion) => {
            const fa = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
            const fb = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
            return fb - fa;
          })[0]
        : postulacionesList[0];

      setPostulacion(postulacionActiva || null);

      const idPostulacionActiva = String(postulacionActiva?.id_postulacion || "").trim();
      const docsPostulacion = idPostulacionActiva
        ? docsList.filter((d) => getDocPostulacionId(d) === idPostulacionActiva)
        : [];

      setDocumentos(docsPostulacion);

      console.log("📊 Mi Solicitud: documentos cargados:", {
        id_postulacion: idPostulacionActiva,
        total: docsPostulacion.length,
        con_url: docsPostulacion.filter((d) => !!d.url_archivo && String(d.url_archivo).trim() !== "").length,
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id_cliente]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden) loadData(); };
    const handleFocus = () => loadData();
    const handleDocumentUpdate = () => loadData();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("documentosUpdated", handleDocumentUpdate);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("documentosUpdated", handleDocumentUpdate);
    };
  }, [loadData]);

  const documentosRequeridos = useMemo(() => {
    if (!postulacion) return [];

    const requeridosEstandar = [
      "Cédula de identidad",
      "Acta de grado",
      "Título de bachiller",
      "Foto tamaño carnet",
    ];

    const tiposDocumentosExistentes = documentos.map((d) => d.tipo_documento);

    const todosTipos = tiposDocumentosExistentes.length > 0
      ? [...new Set([...tiposDocumentosExistentes, ...requeridosEstandar])]
      : requeridosEstandar;

    return todosTipos.map((tipo) => {
      const docExistente = documentos.find((d) => tipoKey(d.tipo_documento) === tipoKey(tipo)) || null;
      const urlOk = !!docExistente?.url_archivo && String(docExistente.url_archivo).trim() !== "";
      return {
        tipo_documento: tipo,
        existe: !!docExistente && urlOk,
        documento: docExistente,
        esRequeridoPorAsesor: tiposDocumentosExistentes.includes(tipo),
      };
    }).sort((a, b) => {
      if (a.esRequeridoPorAsesor && !b.esRequeridoPorAsesor) return -1;
      if (!a.esRequeridoPorAsesor && b.esRequeridoPorAsesor) return 1;
      return 0;
    });
  }, [postulacion, documentos]);

  const docsProgreso = useMemo(() => {
    const total = documentosRequeridos.length || 4;
    const cargados = documentosRequeridos.filter((d) => d.existe && !!d.documento?.url_archivo).length;
    const porcentaje = total > 0 ? Math.round((cargados / total) * 100) : 0;
    return { cargados, total, porcentaje };
  }, [documentosRequeridos]);

  const steps = useMemo<StepData[]>(() => {
    const fechaRegistro = cliente?.fecha_registro
      ? new Date(cliente.fecha_registro).toISOString().split("T")[0]
      : undefined;

    const fechaPostulacion = postulacion?.fecha_postulacion
      ? new Date(postulacion.fecha_postulacion).toISOString().split("T")[0]
      : undefined;

    const docsCompleted = docsProgreso.cargados;
    const docsTotal = docsProgreso.total;
    const docsInProgress = docsCompleted > 0 && docsCompleted < docsTotal;

    const estadoPostulacion = String(postulacion?.estado_postulacion || "").toLowerCase();

    // Regla de coherencia del flujo:
    // - No puede haber entrevista/resultado si aún no se completan documentos.
    const documentosOk = docsTotal > 0 && docsCompleted >= docsTotal;

    const hasFinalResult = /(aprob|rechaz|admit|no admit|finaliz|cancel)/i.test(estadoPostulacion);
    const hasInterview = /entrevista/i.test(estadoPostulacion);
    const interviewDone = /(entrevista).*(realiz|complet|finaliz)/i.test(estadoPostulacion) || (hasFinalResult && hasInterview);

    const entrevistaStatus: StepData["status"] = !documentosOk
      ? "pending"
      : interviewDone
      ? "completed"
      : hasInterview
      ? "in-progress"
      : "pending";

    const entrevistaDescription = !documentosOk
      ? "Pendiente"
      : interviewDone
      ? "Completada"
      : hasInterview
      ? "En progreso"
      : "Pendiente";

    // Regla: Resultado SOLO puede mostrarse completado cuando:
    // - Documentos están completos
    // - Entrevista está completada
    // - Existe un estado final real en la postulación
    const resultadoListo = documentosOk && entrevistaStatus === "completed" && hasFinalResult;
    const resultadoStatus: StepData["status"] = resultadoListo ? "completed" : "pending";
    const resultadoDescription = resultadoListo
      ? (postulacion?.estado_postulacion || "Completado")
      : "Pendiente";

    return [
      { label: "Registro", date: fechaRegistro, status: cliente ? "completed" : "pending" },
      { label: "Formulario de admisión", date: fechaPostulacion, status: postulacion ? "completed" : "pending" },
      {
        label: "Documentos",
        status: docsCompleted >= docsTotal && docsTotal > 0 ? "completed" : (docsInProgress || docsCompleted > 0) ? "in-progress" : "pending",
        description: docsCompleted >= docsTotal && docsTotal > 0 ? "Completado" : `${docsCompleted}/${docsTotal} completados`,
      },
      { label: "Entrevista", status: entrevistaStatus, description: entrevistaDescription },
      { label: "Resultado", status: resultadoStatus, description: resultadoDescription },
    ];
  }, [cliente, postulacion, docsProgreso]);

  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const inProgressSteps = steps.filter((s) => s.status === "in-progress").length;
  const overallProgress = steps.length > 0
    ? Math.round(((completedSteps + (inProgressSteps * 0.5)) / steps.length) * 100)
    : 0;

  const currentStepIndex = Math.max(0, steps.findIndex((s) => s.status === "in-progress"));
  const estadoActual = useMemo(() => {
    if (!postulacion) return "Sin postulación";
    if (steps[2]?.status === "in-progress") return "Revisión de documentos";
    if (steps[2]?.status === "completed") return "Documentos completados";
    return postulacion.estado_postulacion || "En proceso";
  }, [postulacion, steps]);

  const getStepIcon = (status: StepData["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />;
      case "in-progress":
        return <AccessTimeIcon sx={{ color: "#3b82f6", fontSize: 20 }} />;
      default:
        return <ErrorOutlineIcon sx={{ color: "#9ca3af", fontSize: 20 }} />;
    }
  };

  const getStatusLabel = (status: StepData["status"]) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in-progress":
        return "En progreso";
      default:
        return "Pendiente";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!postulacion) {
    return (
      <Alert severity="warning">
        No se encontró una postulación activa para cargar tu solicitud.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.25 }}>
            Mi Proceso de Admisión
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Sigue el progreso de tu solicitud
          </Typography>
        </Box>
      </Box>

      {/* Progreso principal */}
      <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2, overflow: "hidden" }}>
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

          {/* Barra de progreso (estilo ejemplo / documentos) */}
          <Box
            sx={{
              height: 10,
              borderRadius: 999,
              bgcolor: "#d1fae5",
              overflow: "hidden",
              mb: 1.25,
            }}
          >
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

          {/* Fila inferior: Paso + indicadores */}
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
                {Math.min(currentStepIndex + 1, steps.length)}
              </Box>

              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Paso{" "}
                <Box component="span" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  {Math.min(currentStepIndex + 1, steps.length)}
                </Box>{" "}
                de {steps.length}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {steps.map((_, i) => {
                const active = i < Math.min(currentStepIndex + 1, steps.length);
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

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2, alignItems: "start" }}>
        {/* Timeline */}
        <Card sx={{ borderRadius: 3, boxShadow: 2, alignSelf: "start" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.25 }}>
              Proceso de Admisión
            </Typography>

            <Box sx={{ position: "relative" }}>
              {steps.map((step, index) => (
                <Box
                  key={step.label}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    mb: index < steps.length - 1 ? 1.5 : 0,
                    position: "relative",
                    minHeight: 56,
                  }}
                >
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 10,
                        top: 24,
                        width: 2,
                        height: "calc(100% + 12px)",
                        bgcolor: step.status === "completed" ? "#bbf7d0" : "#e5e7eb",
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor:
                        step.status === "completed" ? "#dcfce7" : step.status === "in-progress" ? "#dbeafe" : "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: "1px",
                    }}
                  >
                    {getStepIcon(step.status)}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {step.label}
                    </Typography>

                    {/* Segunda línea fija para que el spacing sea equitativo */}
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
                      {step.date || getStatusLabel(step.status)}
                    </Typography>

                    {/* Chip siempre en la misma posición */}
                    <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={step.description || getStatusLabel(step.status)}
                        size="small"
                        sx={{
                          bgcolor:
                            step.status === "completed" ? "#dcfce7" : step.status === "in-progress" ? "#dbeafe" : "#f3f4f6",
                          color:
                            step.status === "completed" ? "#16a34a" : step.status === "in-progress" ? "#2563eb" : "#64748b",
                          fontWeight: 600,
                          height: 22,
                        }}
                      />
                      {step.label === "Documentos" && step.status !== "completed" && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate("/aspirante/documentos")}
                          sx={{ textTransform: "none", borderRadius: 2, py: 0.25 }}
                        >
                          Completar ahora
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.25 }}>
                Información Personal
              </Typography>

              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Nombre completo
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {cliente ? `${cliente.nombres} ${cliente.apellidos}` : "—"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Programa
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {postulacion?.carrera?.nombre_carrera || "—"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {cliente?.correo || user?.email || "—"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {cliente?.celular || cliente?.telefono || "—"}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/aspirante/perfil")}
                  size="small"
                  sx={{ textTransform: "none", borderRadius: 2 }}
                >
                  Editar perfil
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.25 }}>
                Documentos Requeridos
              </Typography>

              <Stack spacing={1}>
                {documentosRequeridos.map((req, index) => {
                  const doc = req.documento;
                  const isUploaded = !!req.existe && !!doc?.url_archivo && String(doc.url_archivo).trim() !== "";

                  return (
                    <Box
                      key={`${req.tipo_documento}-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.25,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: isUploaded ? "#f0fdf4" : "#f8fafc",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: isUploaded ? "#dcfce7" : "#eef2f7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isUploaded ? (
                            <CheckCircleIcon sx={{ color: "#16a34a" }} />
                          ) : (
                            <UploadFileIcon sx={{ color: "#94a3b8" }} />
                          )}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }} noWrap>
                            {req.tipo_documento}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", display: "block" }} noWrap>
                            {isUploaded ? (doc?.nombre_archivo || "Archivo cargado") : "Pendiente de subir"}
                          </Typography>
                        </Box>
                      </Box>

                      {!isUploaded && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigate("/aspirante/documentos")}
                          sx={{ textTransform: "none", fontWeight: 700, color: "#2563eb", px: 1 }}
                        >
                          Subir
                        </Button>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
