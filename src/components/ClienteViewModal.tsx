import {
  Dialog,
  Box,
  Avatar,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import Person from "@mui/icons-material/Person";
import Email from "@mui/icons-material/Email";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Phone from "@mui/icons-material/Phone";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Public from "@mui/icons-material/Public";
import School from "@mui/icons-material/School";
import Description from "@mui/icons-material/Description";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import DownloadIcon from "@mui/icons-material/Download";
import type { Cliente } from "../services/cliente.service";
import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import * as postulacionService from "../services/postulacion.service";
import type { Postulacion } from "../services/postulacion.service";
import type { DocumentoPostulacion } from "../services/documentoPostulacion.service";
import type { Beca } from "../services/beca.service";
import type { BecaEstudiante } from "../services/becaEstudiante.service";
import { api } from "../services/api";

interface ClienteViewModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
  /** Opcional: si se provee, el modal muestra listas y botones (asesor/admin). */
  postulaciones?: Postulacion[];
  documentos?: DocumentoPostulacion[];
  becasDisponibles?: Beca[];
  becaAsignada?: BecaEstudiante | null;
  loadingDetail?: boolean;
  onCrearPostulacionClick?: () => void;
  onSubirDocumentoClick?: () => void;
  onAsignarBecaClick?: () => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
}

function InfoCard({ icon, label, value, iconColor }: InfoCardProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        height: "100%",
        bgcolor: "white",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ color: iconColor, display: "flex", alignItems: "center", mt: 0.5 }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                fontWeight: 500,
                display: "block",
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "0.875rem",
                wordBreak: "break-word",
              }}
            >
              {value || "-"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ClienteViewModal({
  open,
  onClose,
  cliente,
  postulaciones,
  documentos,
  becasDisponibles,
  becaAsignada,
  loadingDetail,
  onCrearPostulacionClick,
  onSubirDocumentoClick,
  onAsignarBecaClick,
}: ClienteViewModalProps) {
  const [postulacionesCount, setPostulacionesCount] = useState(0);
  const [fileError, setFileError] = useState<string>("");

  const resolveUrl = (url?: string) => {
    let raw = String(url || "").trim();
    if (!raw) return "";
    const toSecureByFilename = (filename: string) => `/documentos-postulacion/files/${filename}`;

    // Si viene URL absoluta apuntando a /uploads, convertirla a la ruta segura real
    // (porque el archivo se guarda en public/documentos-postulacion y se sirve por /documentos-postulacion/files/:filename)
    if (/^https?:\/\//i.test(raw) && raw.includes("/uploads/")) {
      return raw.replace("/uploads/", "/documentos-postulacion/files/");
    }
    if (/^https?:\/\//i.test(raw)) return raw;

    // Si viene solo "archivo.pdf" o "/archivo.pdf"
    if (/^[^/]+\.[a-z0-9]+$/i.test(raw)) raw = toSecureByFilename(raw);
    if (/^\/[^/]+\.[a-z0-9]+$/i.test(raw)) raw = toSecureByFilename(raw.slice(1));

    // Si viene como "/uploads/archivo.pdf" o "uploads/archivo.pdf", mapear a endpoint seguro
    if (raw.startsWith("/uploads/")) raw = toSecureByFilename(raw.replace(/^\/uploads\//, ""));
    if (raw.startsWith("uploads/")) raw = toSecureByFilename(raw.replace(/^uploads\//, ""));

    const baseURL = String(api.defaults.baseURL || "").replace(/\/$/, "");
    if (!baseURL) return raw;
    if (raw.startsWith("/")) return `${baseURL}${raw}`;
    return `${baseURL}/${raw}`;
  };

  const isSameOriginAsApi = (absoluteUrl: string) => {
    try {
      const apiBase = String(api.defaults.baseURL || "").trim();
      if (!apiBase) return false;
      const a = new URL(absoluteUrl);
      const b = new URL(apiBase);
      return a.origin === b.origin;
    } catch {
      return false;
    }
  };

  const canPreview = (url?: string) => {
    const u = resolveUrl(url);
    if (!u) return false;
    // URLs temporales de fallback no son previsualizables/descargables reales
    if (u.includes("/temp/")) return false;
    return true;
  };

  const downloadWithAuth = async (url?: string, nombre?: string) => {
    const u = resolveUrl(url);
    if (!u) return;
    // Si es un URL externo, abrir directo (CORS/auth fuera de nuestro control)
    if (!isSameOriginAsApi(u)) {
      window.open(u, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const res = await api.get(u, { responseType: "arraybuffer", timeout: 20000 });
      const contentType = String((res as any)?.headers?.["content-type"] || "application/octet-stream");
      const blob = new Blob([res.data as ArrayBuffer], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = nombre || "documento";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const status = (e as any)?.response?.status;
      let msg = (e as any)?.response?.data?.message || (e as any)?.message || "Error";
      const data = (e as any)?.response?.data;
      if (data instanceof ArrayBuffer) {
        try {
          const text = new TextDecoder().decode(new Uint8Array(data));
          const parsed = JSON.parse(text);
          msg = parsed?.message || text || msg;
        } catch {
          // ignore
        }
      }
      setFileError(`No se pudo descargar (HTTP ${status || "?"}). ${msg}. URL: ${u}`);
    }
  };

  useEffect(() => {
    if (Array.isArray(postulaciones)) {
      setPostulacionesCount(postulaciones.length);
      return;
    }
    if (cliente?.id_cliente) {
      postulacionService
        .getPostulaciones({ limit: 1000 })
        .then((r: any) => {
          const postulaciones = Array.isArray(r) ? r : r?.items ?? [];
          const count = postulaciones.filter(
            (p: any) => p.id_cliente === cliente.id_cliente || (p.cliente as any)?.id_cliente === cliente.id_cliente
          ).length;
          setPostulacionesCount(count);
        })
        .catch(() => setPostulacionesCount(0));
    }
  }, [cliente?.id_cliente, postulaciones]);

  if (!cliente) return null;

  const initials = getInitials(cliente.nombres, cliente.apellidos);
  const nombreCompleto = `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header con gradiente morado */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          p: 4,
          position: "relative",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              {nombreCompleto}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem",
              }}
            >
              Información completa del aspirante
            </Typography>
          </Box>
          <Chip
            label={cliente.estado || "Nuevo"}
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              height: 32,
            }}
          />
        </Stack>
      </Box>

      {/* Contenido */}
      <Box sx={{ p: 3, bgcolor: "#f9fafb", maxHeight: "calc(90vh - 200px)", overflowY: "auto" }}>
        {/* Información Personal */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Person sx={{ color: "#3b82f6", fontSize: 20 }} />
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "1.125rem",
              }}
            >
              Información Personal
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Person sx={{ fontSize: 20 }} />}
                label="NOMBRES"
                value={cliente.nombres || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Person sx={{ fontSize: 20 }} />}
                label="APELLIDOS"
                value={cliente.apellidos || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<BusinessCenter sx={{ fontSize: 20 }} />}
                label={cliente.tipo_identificacion?.toUpperCase() || "IDENTIFICACIÓN"}
                value={cliente.numero_identificacion || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={
                  <Box sx={{ position: "relative" }}>
                    <Email sx={{ fontSize: 20 }} />
                    <CheckCircle
                      sx={{
                        fontSize: 12,
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        color: "#10b981",
                        bgcolor: "white",
                        borderRadius: "50%",
                      }}
                    />
                  </Box>
                }
                label="CORREO ELECTRÓNICO"
                value={cliente.correo || "-"}
                iconColor="#10b981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Phone sx={{ fontSize: 20 }} />}
                label="TELÉFONO"
                value={cliente.telefono || "-"}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Phone sx={{ fontSize: 20 }} />}
                label="CELULAR"
                value={cliente.celular || "-"}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<CalendarToday sx={{ fontSize: 20 }} />}
                label="FECHA DE NACIMIENTO"
                value={formatDate(cliente.fecha_nacimiento)}
                iconColor="#ec4899"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Person sx={{ fontSize: 20 }} />}
                label="GÉNERO"
                value={cliente.genero || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Public sx={{ fontSize: 20 }} />}
                label="NACIONALIDAD"
                value={cliente.nacionalidad || "-"}
                iconColor="#ef4444"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Public sx={{ fontSize: 20 }} />}
                label="ORIGEN"
                value={cliente.origen || "-"}
                iconColor="#ef4444"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Postulaciones */}
        <Box>
          <Box
            sx={{
              bgcolor: "#f59e0b",
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <School sx={{ color: "white", fontSize: 20 }} />
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "1.125rem",
                  }}
                >
                  Postulaciones ({postulacionesCount})
                </Typography>
              </Stack>
              {onCrearPostulacionClick && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onCrearPostulacionClick}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 800,
                    bgcolor: "rgba(255,255,255,0.35)",
                    color: "#0f172a",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.5)", boxShadow: "none" },
                  }}
                >
                  Crear
                </Button>
              )}
            </Stack>
          </Box>

          {loadingDetail ? (
            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              Cargando postulaciones...
            </Typography>
          ) : Array.isArray(postulaciones) ? (
            postulaciones.length === 0 ? (
              <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                No tiene postulaciones todavía.
              </Typography>
            ) : (
              <Stack spacing={1.25} sx={{ mb: 2 }}>
                {postulaciones.map((p) => (
                  <Card key={p.id_postulacion} sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            {p.carrera?.nombre_carrera || `Carrera ${String(p.id_carrera || "").slice(0, 8)}`}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Período: {p.periodo_academico || "-"} · #{String(p.id_postulacion).slice(0, 8)}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={p.estado_postulacion || "Pendiente"}
                          sx={{ bgcolor: "rgba(255,255,255,0.6)", fontWeight: 800 }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )
          ) : null}

          {/* Documentos */}
          {(Array.isArray(documentos) || onSubirDocumentoClick) && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  bgcolor: "#3b82f6",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Description sx={{ color: "white", fontSize: 20 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.125rem",
                      }}
                    >
                      Documentos ({Array.isArray(documentos) ? documentos.length : 0})
                    </Typography>
                  </Stack>
                  {onSubirDocumentoClick && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={onSubirDocumentoClick}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor: "rgba(255,255,255,0.25)",
                        color: "white",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.35)", boxShadow: "none" },
                      }}
                    >
                      Subir
                    </Button>
                  )}
                </Stack>
              </Box>

              {loadingDetail ? (
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  Cargando documentos...
                </Typography>
              ) : Array.isArray(documentos) ? (
                documentos.length === 0 ? (
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                    No tiene documentos todavía.
                  </Typography>
                ) : (
                  <Stack spacing={1.25} sx={{ mb: 2 }}>
                    {documentos.map((d) => (
                      <Card key={d.id_documento} sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                                {d.tipo_documento || "Documento"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                                {d.nombre_archivo || "-"}
                              </Typography>
                              {d.url_archivo && !canPreview(d.url_archivo) && (
                                <Typography variant="caption" sx={{ mt: 0.25, display: "block", color: "#b45309", fontWeight: 700 }}>
                                  URL temporal (no previsualizable)
                                </Typography>
                              )}
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadIcon fontSize="small" />}
                                onClick={() => downloadWithAuth(d.url_archivo, d.nombre_archivo)}
                                disabled={!d.url_archivo}
                                sx={{ textTransform: "none", borderRadius: 2, fontWeight: 800 }}
                              >
                                Descargar
                              </Button>
                              <Chip size="small" label={d.estado_documento || "Pendiente"} sx={{ bgcolor: "#f1f5f9", fontWeight: 800 }} />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )
              ) : null}
            </Box>
          )}

          {/* Becas */}
          {(becaAsignada !== undefined || Array.isArray(becasDisponibles) || onAsignarBecaClick) && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  bgcolor: "#10b981",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle sx={{ color: "white", fontSize: 20 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1.125rem",
                      }}
                    >
                      Becas ({becaAsignada ? 1 : 0}) · Disponibles: {Array.isArray(becasDisponibles) ? becasDisponibles.length : 0}
                    </Typography>
                  </Stack>
                  {onAsignarBecaClick && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={onAsignarBecaClick}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 800,
                        bgcolor: "rgba(255,255,255,0.25)",
                        color: "white",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.35)", boxShadow: "none" },
                      }}
                    >
                      {becaAsignada ? "Actualizar" : "Asignar"}
                    </Button>
                  )}
                </Stack>
              </Box>

              {loadingDetail ? (
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  Cargando becas...
                </Typography>
              ) : becaAsignada ? (
                <Card sx={{ borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                          {becaAsignada.beca?.nombre_beca || "Beca asignada"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Período: {becaAsignada.periodo_academico || "-"} · Monto: {becaAsignada.monto_otorgado || "-"}
                        </Typography>
                      </Box>
                      <Chip size="small" label={becaAsignada.estado || "Vigente"} sx={{ bgcolor: "#dcfce7", color: "#166534", fontWeight: 800 }} />
                    </Stack>
                  </CardContent>
                </Card>
              ) : (
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  No tiene beca asignada.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          bgcolor: "white",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#3b82f6",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.1)",
            },
          }}
        >
          CERRAR
        </Button>
      </Box>
      <Snackbar
        open={!!fileError}
        autoHideDuration={8000}
        onClose={() => setFileError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" onClose={() => setFileError("")} sx={{ width: "100%" }}>
          {fileError}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
