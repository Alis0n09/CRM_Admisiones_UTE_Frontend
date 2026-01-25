import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import DocumentoViewModal from "../../components/DocumentoViewModal";
import * as docService from "../../services/documentoPostulacion.service";
import * as postulacionService from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import AttachFile from "@mui/icons-material/AttachFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import LinkIcon from "@mui/icons-material/Link";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "../../services/api";

function getTipoIcon(tipo?: string) {
  const tipoLower = tipo?.toLowerCase() || "";
  if (tipoLower.includes("cédula")) return "🆔";
  if (tipoLower.includes("título")) return "🎓";
  if (tipoLower.includes("certificado")) return "📜";
  if (tipoLower.includes("foto")) return "📷";
  return "📄";
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("aprobado")) return "success";
  if (estadoLower.includes("rechazado")) return "error";
  return "default";
}

export default function DocumentosPage() {
  const [items, setItems] = useState<DocumentoPostulacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<{ id_postulacion: string; cliente?: { nombres: string }; carrera?: { nombre_carrera: string } }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<DocumentoPostulacion | null>(null);
  const [form, setForm] = useState<{ id_postulacion: string; tipo_documento: string; nombre_archivo: string; url_archivo: string; estado_documento: string; observaciones: string }>({ id_postulacion: "", tipo_documento: "Cédula", nombre_archivo: "", url_archivo: "", estado_documento: "Pendiente", observaciones: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" | "warning" | "info" });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const resolveUrl = (url?: string) => {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const baseURL = String(api.defaults.baseURL || "").replace(/\/$/, "");
    if (!baseURL) return raw;
    if (raw.startsWith("/")) return `${baseURL}${raw}`;
    return `${baseURL}/${raw}`;
  };

  const canPreview = (url?: string) => {
    const u = resolveUrl(url);
    if (!u) return false;
    if (u.includes("/temp/")) return false;
    return true;
  };

  const handleView = (url?: string) => {
    const u = resolveUrl(url);
    if (!u) return;
    setPreviewUrl(u);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl("");
  };

  const handleDownload = (url?: string, nombre?: string) => {
    const u = resolveUrl(url);
    if (!u) return;
    const link = document.createElement("a");
    link.href = u;
    link.download = nombre || "documento";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/documentos-postulacion/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = data?.url || data?.path || data?.fileUrl || data?.filename || "";
      if (!url) throw new Error("El servidor no devolvió una URL para el archivo");
      return url;
    } catch (error1: any) {
      try {
        const { data } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const url = data?.url || data?.path || data?.fileUrl || data?.filename || "";
        if (!url) throw new Error("El servidor no devolvió una URL para el archivo");
        return url;
      } catch (error2: any) {
        const status = error2?.response?.status || error1?.response?.status;
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const tempUrl = `https://docs.plataforma.edu/postulaciones/temp/${timestamp}_${sanitizedName}`;

        console.warn("⚠️ Admin: Upload no disponible, usando URL temporal", { status, tempUrl });
        return tempUrl;
      }
    }
  };

  const load = useCallback(() => {
    docService.getDocumentosPostulacion()
      .then((r) => {
        const docs = Array.isArray(r) ? r : [];
        console.log("📊 Admin: Documentos cargados (sin filtros - todos los documentos):", {
          total: docs.length,
          documentos: docs.map(d => ({
            id: d.id_documento,
            tipo: d.tipo_documento,
            id_postulacion: d.id_postulacion,
            url_archivo: d.url_archivo,
            tiene_url: !!d.url_archivo
          }))
        });
        setItems(docs);
      })
      .catch((err) => {
        console.error("❌ Error cargando documentos en admin:", err);
        setItems([]);
      });
  }, []);

  useEffect(() => {
    load();
    
    // Escuchar eventos de actualización de documentos para actualizar automáticamente
    // Cuando un aspirante sube un documento, admin/asesor también lo verán (mismo registro en BD)
    const handleDocumentosUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("📄 Admin: Evento de actualización de documentos recibido", customEvent.detail);
      console.log("📄 Admin: Recargando documentos para mostrar el nuevo documento subido por el aspirante");
      load();
    };

    window.addEventListener("documentosUpdated", handleDocumentosUpdated);

    return () => {
      window.removeEventListener("documentosUpdated", handleDocumentosUpdated);
    };
  }, [load]);
  useEffect(() => {
    postulacionService.getPostulaciones({ limit: 500 }).then((r: any) => setPostulaciones(r?.items ?? (Array.isArray(r) ? r : []))).catch(() => setPostulaciones([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_postulacion: postulaciones[0]?.id_postulacion || "", tipo_documento: "Cédula", nombre_archivo: "", url_archivo: "/uploads/doc.pdf", estado_documento: "Pendiente", observaciones: "" }); setOpen(true); };
  const handleView = (r: DocumentoPostulacion) => { setSel(r); setOpenView(true); };
  const openEdit = (r: DocumentoPostulacion) => { setSel(r); setForm({ id_postulacion: r.id_postulacion, tipo_documento: r.tipo_documento, nombre_archivo: r.nombre_archivo, url_archivo: r.url_archivo, estado_documento: r.estado_documento || "Pendiente", observaciones: r.observaciones || "" }); setOpen(true); };

  const save = () => {
    // Validación de campos requeridos (alineado con CreateDocumentosPostulacionDto)
    if (!form.id_postulacion || !form.tipo_documento || !form.nombre_archivo || !form.url_archivo) {
      setSnackbar({ open: true, severity: "error", message: "Completa los campos requeridos: Postulación, Tipo, Nombre archivo y URL archivo" });
      return; 
    }
    
    // Estructura del documento (alineada con el backend)
    const documentoData = {
      id_postulacion: form.id_postulacion,
      tipo_documento: form.tipo_documento,
      nombre_archivo: form.nombre_archivo,
      url_archivo: form.url_archivo,
      estado_documento: form.estado_documento || "Pendiente",
      observaciones: form.observaciones || "",
    };

    console.log("📤 Admin/Asesor: Enviando documento al backend:", documentoData);
    console.log("📤 Este documento aparecerá para todos los roles (mismo registro en BD)");

    (sel 
      ? docService.updateDocumentoPostulacion(sel.id_documento, documentoData)
      : docService.createDocumentoPostulacion(documentoData)
    )
      .then((documentoGuardado) => {
        console.log("✅ Admin/Asesor: Documento guardado exitosamente:", documentoGuardado);
        console.log("✅ Este documento será visible para admin, asesor y aspirante (mismo registro)");
        setOpen(false);
        load();
        
        // Disparar evento para actualizar otras páginas
        window.dispatchEvent(new CustomEvent("documentosUpdated", {
          detail: { 
            documentoGuardado,
            tipoDocumento: documentoData.tipo_documento,
            mensaje: "Documento creado/actualizado por admin/asesor - visible para todos los roles"
          }
        }));

        setSnackbar({ open: true, severity: "success", message: sel ? "Documento actualizado exitosamente" : "Documento guardado exitosamente" });
      })
      .catch((e) => {
        console.error("❌ Admin/Asesor: Error al guardar documento:", e?.response?.data || e);
        setSnackbar({ open: true, severity: "error", message: e?.response?.data?.message || "Error al guardar el documento" });
      });
  };

  const del = (row: DocumentoPostulacion) => {
    if (!confirm("¿Eliminar este documento?")) return;
    docService.deleteDocumentoPostulacion(row.id_documento)
      .then(() => {
        load();
        setSnackbar({ open: true, severity: "success", message: "Documento eliminado" });
      })
      .catch((e) => setSnackbar({ open: true, severity: "error", message: e?.response?.data?.message || "Error" }));
  };

  const setEstadoRapido = async (row: DocumentoPostulacion, estado: "Aprobado" | "Rechazado") => {
    try {
      const observaciones = estado === "Rechazado"
        ? (prompt("Motivo de rechazo (observaciones):") || "").trim()
        : (row.observaciones || "");

      if (estado === "Rechazado" && !observaciones) {
        setSnackbar({ open: true, severity: "warning", message: "Para rechazar, ingresa observaciones." });
        return;
      }

      await docService.updateDocumentoPostulacion(row.id_documento, {
        estado_documento: estado,
        observaciones,
      });
      setSnackbar({ open: true, severity: "success", message: `Documento ${estado.toLowerCase()} exitosamente` });
      load();

      window.dispatchEvent(new CustomEvent("documentosUpdated", {
        detail: {
          documentoGuardado: { ...row, estado_documento: estado, observaciones },
          tipoDocumento: row.tipo_documento,
          mensaje: "Documento validado por admin/asesor - visible para todos los roles",
        },
      }));
    } catch (e: any) {
      setSnackbar({ open: true, severity: "error", message: e?.response?.data?.message || "Error al validar documento" });
    }
  };

  const cols = useMemo<Column<DocumentoPostulacion>[]>(() => [
    {
      id: "tipo_documento",
      label: "Tipo de Documento",
      minWidth: 200,
      format: (v, r) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h6">{getTipoIcon(v)}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {v || "-"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6b7280", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
              {r.url_archivo ? (r.url_archivo.includes("/temp/") ? "Archivo en proceso (URL temporal)" : "Archivo cargado") : "Sin archivo"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "nombre_archivo",
      label: "Archivo",
      minWidth: 260,
      format: (v, r) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
            <AttachFile sx={{ color: "#6b7280", fontSize: 18 }} />
            <Typography variant="body2" sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {v || "-"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Copiar URL">
              <span>
                <IconButton
                  size="small"
                  disabled={!r.url_archivo}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(resolveUrl(r.url_archivo));
                      setSnackbar({ open: true, severity: "success", message: "URL copiada al portapapeles" });
                    } catch {
                      setSnackbar({ open: true, severity: "error", message: "No se pudo copiar la URL" });
                    }
                  }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={canPreview(r.url_archivo) ? "Visualizar" : "No disponible para URL temporal"}>
              <span>
                <IconButton size="small" disabled={!canPreview(r.url_archivo)} onClick={() => handleView(r.url_archivo)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Descargar">
              <span>
                <IconButton size="small" disabled={!r.url_archivo} onClick={() => handleDownload(r.url_archivo, r.nombre_archivo)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      ),
    },
    {
      id: "postulacion",
      label: "Postulación",
      minWidth: 180,
      format: (_, r) => r.postulacion ? (
        <Chip
          label={`#${(r.postulacion as any).id_postulacion?.slice(0, 8)} · ${r.postulacion?.carrera?.nombre_carrera || "—"}`}
          size="small"
          sx={{ bgcolor: "#e0e7ff", color: "#4338ca", fontWeight: 700 }}
        />
      ) : (
        <Chip label={`#${String(r.id_postulacion || "").slice(0, 8)}`} size="small" sx={{ bgcolor: "#f1f5f9", color: "#0f172a", fontWeight: 700 }} />
      ),
    },
    {
      id: "estado_documento",
      label: "Estado",
      minWidth: 200,
      format: (v, r) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={v || "Pendiente"} size="small" color={getEstadoColor(v) as any} sx={{ fontWeight: 700 }} />
          <Tooltip title="Aprobar">
            <span>
              <IconButton size="small" onClick={() => setEstadoRapido(r, "Aprobado")} sx={{ color: "#16a34a" }}>
                <ThumbUpAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rechazar">
            <span>
              <IconButton size="small" onClick={() => setEstadoRapido(r, "Rechazado")} sx={{ color: "#dc2626" }}>
                <ThumbDownAltIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          {String(v || "").toLowerCase().includes("aprobado") && <CheckCircleIcon sx={{ fontSize: 18, color: "#10b981" }} />}
        </Stack>
      ),
    },
  ], [items, postulaciones]);

  const handleFilePicked = async (file: File) => {
    setUploading(true);
    try {
      setForm((f) => ({ ...f, nombre_archivo: file.name }));
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, url_archivo: url }));
      if (String(url).includes("/temp/")) {
        setSnackbar({ open: true, severity: "warning", message: "Upload no disponible: se usará URL temporal (no previsualizable)." });
      } else {
        setSnackbar({ open: true, severity: "success", message: "Archivo cargado. Ahora puedes guardar el documento." });
      }
    } catch (e: any) {
      setSnackbar({ open: true, severity: "error", message: e?.message || "Error al subir archivo" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <DataTable title="Documentos de postulación" columns={cols} rows={items.slice((page - 1) * limit, page * limit)} total={items.length} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onView={handleView} onEdit={openEdit} onDelete={del} getId={(r) => r.id_documento} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar documento" : "Nuevo documento"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, color: "#0f172a" }}>
              Subir archivo (opcional)
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>
              Si el backend tiene endpoint de carga, se generará una URL real. Si no, se usará URL temporal.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                component="label"
                startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileIcon />}
                disabled={uploading}
                sx={{ textTransform: "none" }}
              >
                {uploading ? "Subiendo..." : "Seleccionar archivo"}
                <input
                  hidden
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFilePicked(f);
                  }}
                />
              </Button>
              {form.url_archivo && (
                <Chip
                  size="small"
                  icon={form.url_archivo.includes("/temp/") ? <CloseIcon /> : <CheckCircleIcon />}
                  label={form.url_archivo.includes("/temp/") ? "URL temporal" : "URL generada"}
                  color={form.url_archivo.includes("/temp/") ? "warning" : "success"}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel>Postulación</InputLabel>
            <Select value={form.id_postulacion} label="Postulación" onChange={(e) => setForm({ ...form, id_postulacion: e.target.value })} required>
              {postulaciones.map((p) => <MenuItem key={p.id_postulacion} value={p.id_postulacion}>Post. {p.id_postulacion.slice(0, 8)} - {p.carrera?.nombre_carrera}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth select label="Tipo" value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Título">Título</MenuItem><MenuItem value="Certificado">Certificado</MenuItem><MenuItem value="Foto">Foto</MenuItem><MenuItem value="Otro">Otro</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Nombre archivo" value={form.nombre_archivo} onChange={(e) => setForm({ ...form, nombre_archivo: e.target.value })} required />
          <TextField margin="dense" fullWidth label="URL archivo" value={form.url_archivo} onChange={(e) => setForm({ ...form, url_archivo: e.target.value })} required helperText={form.url_archivo ? `Se guardará en: ${resolveUrl(form.url_archivo)}` : ""} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado_documento} onChange={(e) => setForm({ ...form, estado_documento: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem><MenuItem value="Aprobado">Aprobado</MenuItem><MenuItem value="Rechazado">Rechazado</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Observaciones" multiline value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <DocumentoViewModal open={openView} onClose={() => setOpenView(false)} documento={sel} />
    </>
  );
}
