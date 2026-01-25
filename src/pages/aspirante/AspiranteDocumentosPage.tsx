import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Stack, 
  CircularProgress,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Grid,
} from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import * as docService from "../../services/documentoPostulacion.service";
import * as postulacionService from "../../services/postulacion.service";
import * as clienteService from "../../services/cliente.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { Postulacion } from "../../services/postulacion.service";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

// Descripciones de documentos requeridos
const descripcionesDocumentos: Record<string, string> = {
  "Cédula de identidad": "Copia escaneada de ambos lados",
  "Acta de grado": "Acta de grado o certificado de graduación",
  "Certificado de notas": "Certificado oficial de notas de bachillerato",
  "Título de bachiller": "Copia del título de bachiller",
  "Foto tamaño carnet": "Fotografía reciente fondo blanco (3x4 cm)",
  "Carta de motivación": "Documento en PDF, máximo 2 páginas",
  "Certificado médico": "Certificado médico general no mayor a 3 meses",
};

// Documentos mandatorios que SIEMPRE deben mostrarse
const DOCUMENTOS_MANDATORIOS = [
  "Cédula de identidad",
  "Acta de grado",
  "Título de bachiller",
  "Foto tamaño carnet",
];

export default function AspiranteDocumentosPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<DocumentoPostulacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoPostulacion | null>(null);
  const [selectedTipoDoc, setSelectedTipoDoc] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [form, setForm] = useState({
    id_postulacion: "",
    tipo_documento: "",
    nombre_archivo: "",
    url_archivo: "",
    estado_documento: "Pendiente",
    observaciones: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [docs, postuls] = await Promise.all([
        docService.getDocumentosPostulacion(),
        postulacionService.getPostulaciones(),
      ]);
      
      const docsList = Array.isArray(docs) ? docs : [];
      const postulsList = Array.isArray(postuls) 
        ? postuls 
        : (postuls as any)?.items || [];
      
      // Filtrar documentos del cliente actual
      const docsCliente = docsList.filter((d: DocumentoPostulacion) => {
        const postulacion = postulsList.find((p: Postulacion) => 
          p.id_postulacion === d.id_postulacion && p.id_cliente === user?.id_cliente
        );
        return !!postulacion;
      });
      
      setItems(docsCliente);
      const postulsCliente = postulsList.filter((p: Postulacion) => p.id_cliente === user?.id_cliente);
      setPostulaciones(postulsCliente);
      
      // Obtener la postulación activa (la más reciente o la primera disponible)
      // Si el usuario está en la página de aspirantes, SIEMPRE tiene una postulación activa
      let postulacionActiva = null;
      if (postulsCliente.length > 0) {
        postulacionActiva = postulsCliente.sort((a, b) => {
          // Ordenar por fecha de postulación (más reciente primero)
          const fechaA = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
          const fechaB = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
          return fechaB - fechaA;
        })[0];
      }
      
      // Si no se encontró postulación, usar la primera disponible o crear una referencia
      if (!postulacionActiva && postulsCliente.length > 0) {
        postulacionActiva = postulsCliente[0];
      }
      
      setPostulacion(postulacionActiva);
    } catch (error) {
      console.error("Error cargando documentos:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id_cliente]);

  useEffect(() => {
    load();
  }, [load]);

  // Documentos requeridos: siempre incluye los mandatorios + los especificados por el asesor
  const documentosRequeridos = useMemo(() => {
    // Obtener tipos de documentos especificados por el asesor (si hay postulación)
    const tiposDocumentosEnPostulacion = postulacion
      ? items
          .filter(d => d.id_postulacion === postulacion.id_postulacion)
          .map(d => d.tipo_documento)
      : [];

    // Combinar documentos mandatorios con los especificados por el asesor
    // Los mandatorios siempre deben aparecer PRIMERO y en el orden específico
    const todosTipos = [
      ...DOCUMENTOS_MANDATORIOS, // Mantener el orden: Cédula, Acta, Título, Foto
      ...tiposDocumentosEnPostulacion.filter(tipo => !DOCUMENTOS_MANDATORIOS.includes(tipo))
    ];

    // Crear la lista de documentos requeridos con su estado
    const documentos = todosTipos.map(tipo => {
      // Buscar documento existente (solo si hay postulación)
      const docExistente = postulacion
        ? items.find(
            d => d.id_postulacion === postulacion.id_postulacion && d.tipo_documento === tipo
          )
        : null;
      
      return {
        tipo_documento: tipo,
        existe: !!docExistente && !!docExistente.url_archivo,
        documento: docExistente || null,
        esRequeridoPorAsesor: tiposDocumentosEnPostulacion.includes(tipo),
        esMandatorio: DOCUMENTOS_MANDATORIOS.includes(tipo),
        // Agregar índice para mantener el orden de los mandatorios
        indiceMandatorio: DOCUMENTOS_MANDATORIOS.indexOf(tipo),
      };
    });

    // Ordenar: primero los 4 mandatorios en su orden específico, luego los demás
    return documentos.sort((a, b) => {
      // Priorizar documentos mandatorios primero y mantener su orden
      if (a.esMandatorio && b.esMandatorio) {
        return a.indiceMandatorio - b.indiceMandatorio;
      }
      if (a.esMandatorio && !b.esMandatorio) return -1;
      if (!a.esMandatorio && b.esMandatorio) return 1;
      // Luego priorizar documentos especificados por el asesor
      if (a.esRequeridoPorAsesor && !b.esRequeridoPorAsesor) return -1;
      if (!a.esRequeridoPorAsesor && b.esRequeridoPorAsesor) return 1;
      return 0;
    });
  }, [postulacion, items]);

  // Calcular progreso
  const progreso = useMemo(() => {
    if (documentosRequeridos.length === 0) return 0;
    const cargados = documentosRequeridos.filter(d => d.existe && d.documento?.url_archivo).length;
    return Math.round((cargados / documentosRequeridos.length) * 100);
  }, [documentosRequeridos]);

  // Calcular documentos cargados y total (debe estar antes del return condicional)
  const documentosCargados = useMemo(() => {
    return documentosRequeridos.filter(d => d.existe && d.documento?.url_archivo).length;
  }, [documentosRequeridos]);

  const totalDocumentos = useMemo(() => {
    return documentosRequeridos.length;
  }, [documentosRequeridos]);


  const handleOpenDialog = (tipoDoc?: string, doc?: DocumentoPostulacion) => {
    setSelectedFile(null);
    setUploadError("");
    if (doc) {
      // Editar documento existente
      setSelectedDoc(doc);
      setSelectedTipoDoc("");
      setForm({
        id_postulacion: doc.id_postulacion,
        tipo_documento: doc.tipo_documento,
        nombre_archivo: doc.nombre_archivo,
        url_archivo: doc.url_archivo,
        estado_documento: doc.estado_documento || "Pendiente",
        observaciones: doc.observaciones || "",
      });
    } else {
      // Subir nuevo documento
      // Si estamos en la página de aspirantes, el usuario SIEMPRE tiene una postulación activa
      // Intentar obtener la postulación de múltiples fuentes
      let postulacionActiva = postulacion || postulaciones[0];
      
      // Si no hay postulación en el estado, intentar obtenerla
      if (!postulacionActiva && postulaciones.length > 0) {
        postulacionActiva = postulaciones[0];
        setPostulacion(postulaciones[0]);
      }
      
      setSelectedDoc(null);
      setSelectedTipoDoc(tipoDoc || "");
      
      // No mostrar error aquí - si estamos en la página de aspirantes, debe haber una postulación
      // Se obtendrá automáticamente en handleSave si no está disponible aquí
      
      setForm({
        id_postulacion: postulacionActiva?.id_postulacion || "",
        tipo_documento: tipoDoc || "",
        nombre_archivo: "",
        url_archivo: "",
        estado_documento: "Pendiente",
        observaciones: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDoc(null);
    setSelectedTipoDoc("");
    setSelectedFile(null);
    setUploadError("");
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
      const { data } = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data.url || data.path || data.fileUrl || "";
    } catch (error: any) {
      // Si el endpoint /upload no existe, intentar con /documentos-postulacion/upload
      try {
        const { data } = await api.post("/documentos-postulacion/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return data.url || data.path || data.fileUrl || "";
      } catch (error2: any) {
        throw new Error(error2?.response?.data?.message || "Error al subir el archivo");
      }
    }
  };

  const handleSave = async () => {
    // Obtener tipo_documento (del form o del selectedTipoDoc)
    const tipoDocumento = form.tipo_documento || selectedTipoDoc;

    // Validar campos requeridos
    if (!tipoDocumento) {
      setUploadError("Por favor selecciona el tipo de documento");
      return;
    }

    // Si estamos en la página de aspirantes, el usuario SIEMPRE tiene una postulación activa
    // Intentar obtener la postulación de múltiples fuentes de manera agresiva
    let idPostulacionFinal = form.id_postulacion || postulacion?.id_postulacion || postulaciones[0]?.id_postulacion;
    
    // Si aún no hay id_postulacion, intentar obtenerla del backend
    if (!idPostulacionFinal) {
      try {
        const postuls = await postulacionService.getPostulaciones();
        const postulsList = Array.isArray(postuls) 
          ? postuls 
          : (postuls as any)?.items || [];
        const postulsCliente = postulsList.filter((p: Postulacion) => p.id_cliente === user?.id_cliente);
        
        if (postulsCliente.length > 0) {
          // Ordenar por fecha más reciente
          const postulsOrdenadas = postulsCliente.sort((a, b) => {
            const fechaA = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
            const fechaB = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
            return fechaB - fechaA;
          });
          const nuevaPostulacion = postulsOrdenadas[0];
          setPostulacion(nuevaPostulacion);
          idPostulacionFinal = nuevaPostulacion.id_postulacion;
          setForm({ ...form, id_postulacion: nuevaPostulacion.id_postulacion });
        } else {
          // Si realmente no hay postulaciones, intentar recargar los datos
          await load();
          // Después de recargar, intentar nuevamente
          const postulacionRecargada = postulacion || postulaciones[0];
          if (postulacionRecargada) {
            idPostulacionFinal = postulacionRecargada.id_postulacion;
            setForm({ ...form, id_postulacion: postulacionRecargada.id_postulacion });
          } else {
            // Solo en este caso extremo mostrar un error genérico
            setUploadError("Error al procesar la solicitud. Por favor intenta nuevamente.");
            return;
          }
        }
      } catch (error) {
        // Si hay error, intentar usar los datos que ya tenemos
        const postulacionFallback = postulacion || postulaciones[0];
        if (postulacionFallback) {
          idPostulacionFinal = postulacionFallback.id_postulacion;
          setForm({ ...form, id_postulacion: postulacionFallback.id_postulacion });
        } else {
          setUploadError("Error al procesar la solicitud. Por favor recarga la página.");
          return;
        }
      }
    }

    // Si es un documento nuevo, debe tener un archivo seleccionado
    if (!selectedDoc && !selectedFile) {
      setUploadError("Por favor selecciona un archivo para subir");
      return;
    }

    // idPostulacionFinal ya fue definido arriba si se actualizó, si no usar los valores disponibles
    if (!idPostulacionFinal) {
      idPostulacionFinal = form.id_postulacion || postulacion?.id_postulacion || postulaciones[0]?.id_postulacion;
    }

    // Si es edición y hay un nuevo archivo, o es nuevo documento, subir el archivo
    let urlArchivo = form.url_archivo;
    
    if (selectedFile) {
      try {
        setUploading(true);
        setUploadError("");
        urlArchivo = await uploadFile(selectedFile);
        
        if (!urlArchivo) {
          throw new Error("No se pudo obtener la URL del archivo subido");
        }
      } catch (error: any) {
        setUploadError(error.message || "Error al subir el archivo. Por favor intenta nuevamente.");
        setUploading(false);
        return;
      }
    } else if (!selectedDoc && !urlArchivo) {
      setUploadError("Por favor selecciona un archivo para subir");
      setUploading(false);
      return;
    }

    // Actualizar el nombre del archivo si no está establecido
    const nombreArchivo = form.nombre_archivo || selectedFile?.name || "documento";

    try {
      const documentoData = {
        id_postulacion: idPostulacionFinal,
        tipo_documento: tipoDocumento,
        nombre_archivo: nombreArchivo,
        url_archivo: urlArchivo,
        estado_documento: form.estado_documento || "Pendiente",
        observaciones: form.observaciones || "",
      };

      if (selectedDoc) {
        await docService.updateDocumentoPostulacion(selectedDoc.id_documento, documentoData);
      } else {
        await docService.createDocumentoPostulacion(documentoData);
      }
      handleCloseDialog();
      load();
      
      // Abrir vista preliminar automáticamente después de subir
      if (urlArchivo) {
        setTimeout(() => {
          setPreviewUrl(urlArchivo);
          setPreviewOpen(true);
        }, 500);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al guardar el documento";
      console.error("Error al guardar documento:", error);
      console.error("Error completo:", error?.response);
      
      // Si el error es de permisos, mostrar mensaje más claro
      if (error?.response?.status === 403 || errorMessage.includes("Forbidden") || errorMessage.includes("no permitido")) {
        setUploadError("No tienes permisos para realizar esta acción. Por favor contacta al administrador.");
      } else {
        setUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleView = (url: string) => {
    if (url) {
      setPreviewUrl(url);
      setPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl("");
  };

  const handleDownload = (url: string, nombre: string) => {
    if (url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = nombre || "documento";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFechaCarga = (url?: string) => {
    // Simular fecha de carga (en producción esto vendría del backend)
    if (!url) return null;
    return "2026-01-15";
  };

  const getTamañoArchivo = (url?: string) => {
    // Simular tamaño (en producción esto vendría del backend)
    if (!url) return null;
    return "2.3 MB";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Título - Alineado con páginas de admin y asesor */}
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        <span style={{ color: "#3b82f6" }}>—</span> Documentos Requeridos
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Carga todos los documentos necesarios para tu solicitud
      </Typography>

      {/* Progreso de documentos */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>
            Progreso de documentos
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            {documentosCargados} de {totalDocumentos} documentos cargados
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progreso}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: "#e2e8f0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  },
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#3b82f6", minWidth: 50, textAlign: "right" }}>
              {progreso}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de documentos - Horizontal (4 documentos en una sola fila) */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "nowrap", width: "100%" }}>
        {documentosRequeridos.map((docReq, index) => {
          const estaCargado = docReq.existe && docReq.documento?.url_archivo;
          const doc = docReq.documento;
          const descripcion = descripcionesDocumentos[docReq.tipo_documento] || "Documento requerido para la postulación";

          return (
            <Box key={index} sx={{ display: "flex", flex: "1 1 0", minWidth: 0 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: estaCargado ? 3 : 2,
                  border: estaCargado ? "2px solid #10b981" : "1px solid #e2e8f0",
                  bgcolor: estaCargado ? "#f0fdf4" : "white",
                  position: "relative",
                  transition: "all 0.3s ease",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: estaCargado ? 5 : 4,
                    borderColor: estaCargado ? "#059669" : "#cbd5e1",
                  },
                }}
              >
              <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1, minHeight: "260px" }}>
                {/* Header con icono, título y tag */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2, position: "relative" }}>
                  {/* Icono circular verde con checkmark */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      bgcolor: estaCargado ? "#10b981" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: estaCargado ? "none" : "1px solid #e2e8f0",
                    }}
                  >
                    {estaCargado ? (
                      <CheckCircleIcon sx={{ fontSize: 32, color: "white" }} />
                    ) : (
                      <CloseIcon sx={{ fontSize: 32, color: "#94a3b8" }} />
                    )}
                  </Box>

                  {/* Título y descripción */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", fontSize: "1.1rem" }}>
                        {docReq.tipo_documento}
                      </Typography>
                      {estaCargado && (
                        <Chip
                          label="Cargado"
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#10b981",
                            fontWeight: 600,
                            height: 24,
                            fontSize: "0.75rem",
                            borderRadius: 1.5,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                      {descripcion}
                    </Typography>
                  </Box>
                </Box>

                {/* Área blanca con información del archivo (solo si está cargado) */}
                {estaCargado && doc && (
                  <Box sx={{ 
                    bgcolor: "white", 
                    borderRadius: 1.5, 
                    p: 2.5, 
                    mb: 2,
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 3,
                    width: "100%",
                    minHeight: "70px"
                  }}>
                    <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#1e293b", 
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          lineHeight: 1.4
                        }}
                      >
                        {doc.nombre_archivo}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "#64748b",
                          fontSize: "0.8rem",
                          lineHeight: 1.4
                        }}
                      >
                        Cargado el {getFechaCarga(doc.url_archivo)} • {getTamañoArchivo(doc.url_archivo)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(doc.url_archivo)}
                        sx={{
                          bgcolor: "transparent",
                          color: "#64748b",
                          width: 36,
                          height: 36,
                          "&:hover": { 
                            bgcolor: "#f1f5f9",
                            color: "#3b82f6",
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc.url_archivo, doc.nombre_archivo)}
                        sx={{
                          bgcolor: "transparent",
                          color: "#64748b",
                          width: 36,
                          height: 36,
                          "&:hover": { 
                            bgcolor: "#f1f5f9",
                            color: "#3b82f6",
                          },
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                )}

                {/* Botones de acción */}
                <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
                  {estaCargado && doc ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDialog(undefined, doc)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 1.5,
                        borderColor: "#cbd5e1",
                        color: "#64748b",
                        bgcolor: "white",
                        px: 2.5,
                        py: 0.75,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        "&:hover": {
                          borderColor: "#94a3b8",
                          bgcolor: "#f8fafc",
                        },
                      }}
                    >
                      Reemplazar
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      onClick={() => handleOpenDialog(docReq.tipo_documento)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1.25,
                        background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                        },
                      }}
                    >
                      Cargar documento
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
            </Box>
          );
        })}
      </Box>

      {/* Requisitos importantes */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          bgcolor: "#eff6ff",
          border: "1px solid #bfdbfe",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <InfoIcon sx={{ color: "#3b82f6", mr: 1, fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e40af" }}>
              Requisitos importantes
            </Typography>
          </Box>
          <List dense sx={{ pl: 0 }}>
            <ListItem sx={{ pl: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#3b82f6",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Los documentos deben estar en formato PDF, JPG o PNG"
                primaryTypographyProps={{ variant: "body2", sx: { color: "#1e293b" } }}
              />
            </ListItem>
            <ListItem sx={{ pl: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#3b82f6",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="El tamaño máximo por archivo es de 5 MB"
                primaryTypographyProps={{ variant: "body2", sx: { color: "#1e293b" } }}
              />
            </ListItem>
            <ListItem sx={{ pl: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#3b82f6",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Asegúrate de que los documentos sean legibles y estén completos"
                primaryTypographyProps={{ variant: "body2", sx: { color: "#1e293b" } }}
              />
            </ListItem>
            <ListItem sx={{ pl: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#3b82f6",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Los documentos oficiales deben estar firmados y sellados"
                primaryTypographyProps={{ variant: "body2", sx: { color: "#1e293b" } }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar documento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDoc ? "Reemplazar Documento" : "Cargar Documento"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!selectedDoc && (
              <TextField
                select
                label="Tipo de Documento"
                value={selectedTipoDoc || form.tipo_documento}
                onChange={(e) => {
                  setSelectedTipoDoc(e.target.value);
                  setForm({ ...form, tipo_documento: e.target.value });
                }}
                fullWidth
                required
              >
                {documentosRequeridos
                  .filter(d => !d.existe || !d.documento?.url_archivo)
                  .map((d) => (
                    <MenuItem key={d.tipo_documento} value={d.tipo_documento}>
                      {d.tipo_documento}
                    </MenuItem>
                  ))}
              </TextField>
            )}

            {selectedDoc && (
              <TextField
                label="Tipo de Documento"
                value={form.tipo_documento}
                disabled
                fullWidth
              />
            )}

            <TextField
              label="Nombre del Archivo"
              value={form.nombre_archivo}
              onChange={(e) => setForm({ ...form, nombre_archivo: e.target.value })}
              fullWidth
              required
              placeholder="El nombre se completará automáticamente al seleccionar el archivo"
              disabled={!!selectedFile}
            />

            {/* Selector de archivo */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: "text.secondary", fontWeight: 500 }}>
                Archivo <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <input
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
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
            {selectedDoc && !selectedFile && (
              <TextField
                label="URL del Archivo Actual"
                value={form.url_archivo}
                disabled
                fullWidth
                helperText="Para cambiar el archivo, selecciona uno nuevo arriba"
              />
            )}

            <TextField
              label="Observaciones"
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Notas adicionales sobre el documento..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              textTransform: "none",
              color: "#64748b",
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
              },
              "&:disabled": {
                background: "#e5e7eb",
              },
            }}
          >
            {uploading ? "Subiendo..." : selectedDoc ? "Actualizar" : "Cargar Documento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
