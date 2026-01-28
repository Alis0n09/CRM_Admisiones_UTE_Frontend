import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import DocumentoViewModal from "../../components/DocumentoViewModal";
import * as docService from "../../services/documentoPostulacion.service";
import * as postulacionService from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import School from "@mui/icons-material/School";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { api } from "../../services/api";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const load = useCallback(() => {
    docService.getDocumentosPostulacion()
      .then((r) => {
        const docs = Array.isArray(r) ? r : [];
        setItems(docs);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    const handleDocumentosUpdated = () => load();
    window.addEventListener("documentosUpdated", handleDocumentosUpdated);
    return () => window.removeEventListener("documentosUpdated", handleDocumentosUpdated);
  }, [load]);

  const loadPostulaciones = useCallback(async () => {
    try {
      const r: any = await postulacionService.getPostulaciones({ limit: 500 });
      const posts = r?.items ?? (Array.isArray(r) ? r : []);
      console.log("Postulaciones cargadas:", posts);
      setPostulaciones(posts);
      return posts;
    } catch (error) {
      setPostulaciones([]);
      return [];
    }
  }, []);

  useEffect(() => {
    loadPostulaciones();
    
    // Escuchar eventos de actualización de postulaciones
    const handlePostulacionesUpdated = () => {
      console.log("Evento de actualización de postulaciones recibido, recargando...");
      loadPostulaciones();
    };
    
    window.addEventListener("postulacionesUpdated", handlePostulacionesUpdated);
    return () => window.removeEventListener("postulacionesUpdated", handlePostulacionesUpdated);
  }, [loadPostulaciones]);

  const openAdd = async () => { 
    // Recargar postulaciones antes de abrir el modal para asegurar datos actualizados
    const posts = await loadPostulaciones();
    setSel(null);
    setSelectedFile(null);
    setUploadError("");
    setForm({ id_postulacion: posts[0]?.id_postulacion || "", tipo_documento: "Cédula", nombre_archivo: "", url_archivo: "", estado_documento: "Pendiente", observaciones: "" }); 
    setOpen(true); 
  };
  const handleView = (r: DocumentoPostulacion) => { setSel(r); setOpenView(true); };
  const openEdit = async (r: DocumentoPostulacion) => { 
    // Recargar postulaciones antes de abrir el modal para asegurar datos actualizados
    await loadPostulaciones();
    setSel(r);
    setSelectedFile(null);
    setUploadError("");
    setForm({ id_postulacion: r.id_postulacion, tipo_documento: r.tipo_documento, nombre_archivo: r.nombre_archivo, url_archivo: r.url_archivo, estado_documento: r.estado_documento || "Pendiente", observaciones: r.observaciones || "" }); 
    setOpen(true); 
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Solo se permiten archivos PDF, JPG o PNG");
        return;
      }
      
      // Validar tamaño (5 MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5 MB en bytes
      if (file.size > maxSize) {
        setUploadError("El archivo no puede ser mayor a 5 MB");
        return;
      }
      
      setSelectedFile(file);
      setUploadError("");
      // Actualizar el nombre del archivo automáticamente
      setForm({ ...form, nombre_archivo: file.name });
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Intentar primero con /documentos-postulacion/upload
      const { data } = await api.post("/documentos-postulacion/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const url = data.url || data.path || data.fileUrl || data.filename || "";
      if (!url) {
        throw new Error("El servidor no devolvió una URL para el archivo");
      }
      return url;
    } catch (error: any) {
      // Si el endpoint /documentos-postulacion/upload no existe, intentar con /upload
      try {
        const { data } = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const payload = (data as any)?.data ?? data;
        const url = payload?.url_segura || payload?.url_archivo || payload?.url || payload?.path || payload?.fileUrl || "";
        if (!url) throw new Error("El servidor no devolvió una URL para el archivo");
        return url;
      } catch (error2: any) {
        const errorMessage = error2?.response?.data?.message || error?.response?.data?.message || "Error al subir el archivo";
        const status = error2?.response?.status || error?.response?.status;
        
        console.error("Error al subir archivo:", {
          status,
          message: errorMessage,
          data: error2?.response?.data || error?.response?.data
        });
        
        // Si el error es 404, significa que el endpoint no existe
        if (status === 404) {
          throw new Error("El servicio de carga de archivos no está disponible. Por favor contacta al administrador.");
        }
        
        throw new Error(errorMessage || "Error al subir el archivo. Por favor intenta nuevamente.");
      }
    }
  };

  const save = async () => {
    if (!form.id_postulacion || !form.tipo_documento || !form.nombre_archivo) {
      alert("Completa los campos requeridos: Postulación, Tipo y Nombre archivo");
      return;
    }

    // Si es un documento nuevo, debe tener un archivo seleccionado o una URL
    if (!sel && !selectedFile && !form.url_archivo) {
      setUploadError("Por favor selecciona un archivo para subir o ingresa una URL");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      // Subir el archivo si hay uno seleccionado
      let urlArchivo = form.url_archivo;
      
      if (selectedFile) {
        try {
          urlArchivo = await uploadFile(selectedFile);
          if (!urlArchivo || urlArchivo.trim() === "") {
            throw new Error("El servidor no devolvió una URL válida");
          }
        } catch (uploadError: any) {
          console.error("Error al subir archivo:", uploadError);
          setUploadError(uploadError?.message || "Error al subir el archivo. Por favor intenta nuevamente.");
          setUploading(false);
          return;
        }
      }

      // Validar que tenemos URL del archivo
      if (!urlArchivo || urlArchivo.trim() === "") {
        setUploadError("La URL del archivo es requerida");
        setUploading(false);
        return;
      }
      
      const documentoData = {
        id_postulacion: form.id_postulacion,
        tipo_documento: form.tipo_documento,
        nombre_archivo: form.nombre_archivo,
        url_archivo: urlArchivo,
        estado_documento: form.estado_documento || "Pendiente",
        observaciones: form.observaciones || "",
      };

      await (sel 
        ? docService.updateDocumentoPostulacion(sel.id_documento, documentoData)
        : docService.createDocumentoPostulacion(documentoData)
      );
      
      setOpen(false);
      setSelectedFile(null);
      setUploadError("");
      load();
      window.dispatchEvent(new CustomEvent("documentosUpdated"));
    } catch (e: any) {
      console.error("Error al guardar documento:", e);
      setUploadError(e?.response?.data?.message || e?.message || "Error al guardar el documento");
    } finally {
      setUploading(false);
    }
  };

  const del = (row: DocumentoPostulacion) => {
    if (!confirm("¿Eliminar este documento?")) return;
    docService.deleteDocumentoPostulacion(row.id_documento)
      .then(() => load())
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const resolveUrl = (url?: string) => {
    const raw = String(url || "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    const baseURL = String(api.defaults.baseURL || "").replace(/\/$/, "");
    if (!baseURL) return raw;
    if (raw.startsWith("/")) return `${baseURL}${raw}`;
    return `${baseURL}/${raw}`;
  };

  const buildCandidateUrls = (url?: string) => {
    const raw = String(url || "").trim();
    const baseURL = String(api.defaults.baseURL || "").replace(/\/$/, "");
    if (!raw) return [] as string[];
    if (/^https?:\/\//i.test(raw)) return [raw];
    if (!baseURL) return [raw];

    // Si es path absoluto relativo
    if (raw.startsWith("/")) {
      const noSlash = raw.replace(/^\/+/, "");
      return [
        `${baseURL}/${noSlash}`,
        `${baseURL}/uploads/${noSlash}`,
        `${baseURL}/files/${noSlash}`,
      ];
    }

    // Si es solo filename (sin slashes), probar rutas comunes
    if (!raw.includes("/")) {
      return [
        `${baseURL}/${raw}`,
        `${baseURL}/uploads/${raw}`,
        `${baseURL}/files/${raw}`,
      ];
    }

    // Si es path relativo con carpetas
    return [
      `${baseURL}/${raw.replace(/^\/+/, "")}`,
      `${baseURL}/uploads/${raw.replace(/^\/+/, "")}`,
      `${baseURL}/files/${raw.replace(/^\/+/, "")}`,
    ];
  };

  const handleDownload = async (url: string, nombre: string) => {
    if (!url) {
      alert("No hay URL disponible para descargar");
      return;
    }
    
    const candidates = buildCandidateUrls(url);
    const filename = nombre || "documento";

    // Preferir descarga autenticada (blob) para soportar endpoints protegidos
    for (const candidate of candidates) {
      try {
        const res = await api.get(candidate, { responseType: "blob" });
        const blob: Blob = res.data;
        if (!blob || blob.size === 0) continue;
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        try { URL.revokeObjectURL(objectUrl); } catch {}
        return;
      } catch (error: any) {
        // Intentar siguiente candidato
        console.log(`Error al descargar desde ${candidate}:`, error?.response?.status);
      }
    }

    // Fallback directo
    const u = resolveUrl(url);
    if (!u) {
      alert("No se pudo construir la URL para descargar el archivo");
      return;
    }
    
    try {
      const link = document.createElement("a");
      link.href = u;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      alert("Error al descargar el archivo. Por favor intenta nuevamente.");
    }
  };

  const cols = useMemo<Column<DocumentoPostulacion>[]>(() => [
    {
      id: "tipo_documento",
      label: "TIPO DE DOCUMENTO",
      minWidth: 180,
    },
    {
      id: "nombre_archivo",
      label: "ARCHIVO",
      minWidth: 200,
      format: (v, r) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {v || "-"}
          </Typography>
          {r.url_archivo && (
            <Tooltip title="Descargar archivo">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(r.url_archivo, r.nombre_archivo || "documento");
                }}
                sx={{
                  color: "#3b82f6",
                  "&:hover": {
                    bgcolor: "rgba(59, 130, 246, 0.1)",
                    color: "#2563eb",
                  },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      id: "postulacion",
      label: "POSTULACIÓN",
      minWidth: 200,
      format: (_, r) => r.postulacion ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <School sx={{ color: "#8b5cf6", fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {r.postulacion?.carrera?.nombre_carrera || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {String((r.postulacion as any).id_postulacion || r.id_postulacion || "").slice(0, 8)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">#{String(r.id_postulacion || "").slice(0, 8)}</Typography>
      ),
    },
    {
      id: "estado_documento",
      label: "ESTADO",
      minWidth: 140,
      format: (v) => (
        <Chip 
          label={v || "Pendiente"} 
          size="small" 
          color={getEstadoColor(v) as any}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
  ], []);

  return (
    <>
      <DataTable 
        title="Documentos de postulación" 
        columns={cols} 
        rows={items.slice((page - 1) * limit, page * limit)} 
        total={items.length} 
        page={page} 
        rowsPerPage={limit}
        onPageChange={setPage} 
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} 
        onView={handleView} 
        onEdit={openEdit} 
        onDelete={del} 
        getId={(r) => r.id_documento} 
      />
      <Dialog open={open} onClose={() => { setOpen(false); setSelectedFile(null); setUploadError(""); }} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar documento" : "Nuevo documento"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="dense">
              <InputLabel>Postulación</InputLabel>
              <Select value={form.id_postulacion} label="Postulación" onChange={(e) => setForm({ ...form, id_postulacion: e.target.value })} required>
                {postulaciones.map((p) => {
                  const carreraNombre = p.carrera?.nombre_carrera || (p as any).carrera?.nombre || "Sin carrera";
                  return (
                    <MenuItem key={p.id_postulacion} value={p.id_postulacion}>
                      Post. {p.id_postulacion.slice(0, 8)} - {carreraNombre}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <TextField margin="dense" fullWidth select label="Tipo" value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}>
              <MenuItem value="Cédula">Cédula</MenuItem>
              <MenuItem value="Título">Título</MenuItem>
              <MenuItem value="Certificado">Certificado</MenuItem>
              <MenuItem value="Foto">Foto</MenuItem>
              <MenuItem value="Otro">Otro</MenuItem>
            </TextField>
            <TextField margin="dense" fullWidth label="Nombre archivo" value={form.nombre_archivo} onChange={(e) => setForm({ ...form, nombre_archivo: e.target.value })} required disabled={!!selectedFile} placeholder={selectedFile ? "El nombre se completará automáticamente" : "Nombre del archivo"} />
            
            {/* Selector de archivo */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: "text.secondary", fontWeight: 500 }}>
                Archivo {!sel && <span style={{ color: "#d32f2f" }}>*</span>}
              </Typography>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                id="file-upload-admin"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="file-upload-admin">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={selectedFile ? <CheckCircleIcon /> : <UploadFileIcon />}
                  disabled={uploading}
                  sx={{
                    textTransform: "none",
                    py: 1.5,
                    borderColor: selectedFile ? "#10b981" : "#3b82f6",
                    color: selectedFile ? "#10b981" : "#3b82f6",
                    borderWidth: 2,
                    borderStyle: "dashed",
                    "&:hover": {
                      borderColor: selectedFile ? "#059669" : "#2563eb",
                      bgcolor: selectedFile ? "#f0fdf4" : "#eff6ff",
                      borderWidth: 2,
                    },
                  }}
                >
                  {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : "Seleccionar archivo desde tu computadora"}
                </Button>
              </label>
              {selectedFile && (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                      setForm({ ...form, nombre_archivo: "" });
                    }}
                    sx={{ textTransform: "none", minWidth: "auto", p: 0.5 }}
                  >
                    Cambiar
                  </Button>
                </Box>
              )}
              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}
            </Box>

            {/* Mostrar URL actual si es edición y no hay nuevo archivo */}
            {sel && !selectedFile && (
              <TextField
                margin="dense"
                fullWidth
                label="URL del Archivo Actual"
                value={form.url_archivo}
                disabled
                helperText="Para cambiar el archivo, selecciona uno nuevo arriba"
              />
            )}

            {/* Campo URL archivo (opcional si hay archivo seleccionado) */}
            {!sel && !selectedFile && (
              <TextField margin="dense" fullWidth label="URL archivo (opcional si subes un archivo)" value={form.url_archivo} onChange={(e) => setForm({ ...form, url_archivo: e.target.value })} helperText="O ingresa una URL manualmente si no subes un archivo" />
            )}

            <TextField margin="dense" fullWidth select label="Estado" value={form.estado_documento} onChange={(e) => setForm({ ...form, estado_documento: e.target.value })}>
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="Aprobado">Aprobado</MenuItem>
              <MenuItem value="Rechazado">Rechazado</MenuItem>
            </TextField>
            <TextField margin="dense" fullWidth label="Observaciones" multiline rows={3} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setSelectedFile(null); setUploadError(""); }}>Cancelar</Button>
          <Button variant="contained" onClick={save} disabled={uploading} startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}>
            {uploading ? "Subiendo..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
      <DocumentoViewModal open={openView} onClose={() => setOpenView(false)} documento={sel} onDownload={handleDownload} />
    </>
  );
}
