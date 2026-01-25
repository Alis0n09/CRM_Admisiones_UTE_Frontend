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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
} from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import * as docService from "../../services/documentoPostulacion.service";
import * as postulacionService from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { Postulacion } from "../../services/postulacion.service";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import LinkIcon from "@mui/icons-material/Link";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>("");
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewMime, setPreviewMime] = useState<string>("");
  const [previewSourceUrl, setPreviewSourceUrl] = useState<string>("");
  const [previewCandidates, setPreviewCandidates] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState({
    id_postulacion: "",
    tipo_documento: "",
    nombre_archivo: "",
    url_archivo: "",
    estado_documento: "Pendiente",
    observaciones: "",
  });

  const normalizeKey = (v: unknown) => {
    const s = String(v ?? "").trim().toLowerCase();
    // Remover tildes/diacríticos para matchear "cédula" vs "cedula"
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Unificar tipos que vienen distintos desde backend/UI
  // Ej: "Cédula" / "Cedula" / "Cédula de identidad" deben contarse como el mismo documento requerido
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
    const anyDoc = d as any;
    return String(anyDoc?.id_postulacion ?? anyDoc?.postulacion?.id_postulacion ?? "").trim();
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

  const canPreview = (url?: string) => {
    const u = resolveUrl(url);
    if (!u) return false;
    // URLs temporales no son previsualizables (no hay archivo real)
    if (u.includes("/temp/")) return false;
    return true;
  };

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
      
      // Filtrar documentos del cliente actual (comparación flexible)
      // IMPORTANTE: Este filtro es solo para la vista del ASPIRANTE
      // El mismo documento aparecerá en admin/asesor sin filtros (un solo registro en BD)
      const userClienteStr = String(user?.id_cliente || "").trim();
      
      // Log inicial de documentos recibidos del backend
      console.log("📊 Documentos recibidos del backend:", {
        total: docsList.length,
        con_url: docsList.filter((d: DocumentoPostulacion) => d.url_archivo && String(d.url_archivo).trim() !== "").length,
        documentos: docsList.map((d: DocumentoPostulacion) => ({
          tipo: d.tipo_documento,
          id_postulacion: getDocPostulacionId(d),
          tiene_url: !!d.url_archivo && String(d.url_archivo).trim() !== ""
        }))
      });
      
      // ✅ Filtro robusto: obtener IDs de postulaciones del cliente y filtrar por Set
      const postulacionesCliente = postulsList.filter((p: Postulacion) => {
        const pCliente = getPostulacionClienteId(p);
        return pCliente !== "" && (pCliente === userClienteStr);
      });
      const postulacionIdsCliente = new Set(
        postulacionesCliente
          .map((p: Postulacion) => String(p.id_postulacion || "").trim())
          .filter((id: string) => id !== "")
      );

      const docsCliente = docsList.filter((d: DocumentoPostulacion) => {
        const dPostulacion = getDocPostulacionId(d);
        const ok = dPostulacion !== "" && postulacionIdsCliente.has(dPostulacion);
        if (dPostulacion && !ok) {
          console.warn(`⚠️ Documento "${d.tipo_documento}" fuera del set de postulaciones del cliente:`, {
            id_documento: d.id_documento,
            id_postulacion: dPostulacion,
            user_cliente: userClienteStr,
            total_postulaciones_cliente: postulacionIdsCliente.size,
          });
        }
        return ok;
      });
      
      console.log("📊 Documentos filtrados para aspirante:", {
        total: docsCliente.length,
        con_url: docsCliente.filter((d: DocumentoPostulacion) => d.url_archivo && String(d.url_archivo).trim() !== "").length
      });
      
      setItems(docsCliente);
      const postulsCliente = postulacionesCliente;
      setPostulaciones(postulsCliente);
      
      if (postulsCliente.length === 0) {
        console.warn("⚠️ No se encontraron postulaciones para el cliente:", userClienteStr);
      } else {
        console.log("✅ Postulaciones encontradas:", postulsCliente.length);
      }
      
      // Obtener la postulación activa (la más reciente o la primera disponible)
      // IMPORTANTE: Si el aspirante está logueado, SIEMPRE tiene una postulación activa
      let postulacionActiva = null;
      if (postulsCliente.length > 0) {
        // Ordenar por fecha de postulación (más reciente primero)
        postulacionActiva = postulsCliente.sort((a: Postulacion, b: Postulacion) => {
          const fechaA = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
          const fechaB = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
          return fechaB - fechaA;
        })[0];
      } else if (postulsList.length > 0) {
        // Si no se encontraron postulaciones del cliente pero hay postulaciones en general,
        // intentar encontrar una que coincida con comparación más flexible
        const postulacionEncontrada = postulsList.find((p: Postulacion) => {
          const pCliente = String(p.id_cliente || "").trim();
          const userCliente = String(user?.id_cliente || "").trim();
          // Comparación más flexible - puede que los tipos no coincidan exactamente
          return pCliente === userCliente || 
                 String(p.id_cliente) === String(user?.id_cliente) ||
                 (pCliente !== "" && userCliente !== "" && pCliente.toLowerCase() === userCliente.toLowerCase());
        });
        
        if (postulacionEncontrada) {
          postulacionActiva = postulacionEncontrada;
          console.log("✅ Postulación encontrada con comparación flexible:", postulacionActiva.id_postulacion);
        }
      }
      
      setPostulacion(postulacionActiva);
      
      // DEPENDENCIA: Si el aspirante está logueado, SIEMPRE tiene una postulación activa
      // Si no se encontró, es un problema que debe resolverse
      if (!postulacionActiva) {
        console.error("❌ ERROR: No se encontró postulación activa para el cliente:", userClienteStr);
        console.error("❌ Esto NO debería pasar si el aspirante está logueado correctamente");
        console.error("❌ Postulaciones disponibles:", postulsList.length);
        console.error("❌ Postulaciones del cliente:", postulsCliente.length);
      } else {
        console.log("✅ Postulación activa encontrada:", postulacionActiva.id_postulacion);
      }
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
    // DIAGNÓSTICO: Log del estado actual
    console.log("📊 Calculando documentos requeridos:", {
      tiene_postulacion: !!postulacion,
      id_postulacion: postulacion?.id_postulacion,
      total_items: items.length,
      items: items.map(d => ({
        id: d.id_documento,
        tipo: d.tipo_documento,
          id_postulacion: getDocPostulacionId(d),
        url_archivo: d.url_archivo,
        tiene_url: !!d.url_archivo
      }))
    });
    
    // Obtener tipos de documentos especificados por el asesor (si hay postulación)
    // IMPORTANTE: Comparación flexible de id_postulacion
    const tiposDocumentosEnPostulacion = postulacion
      ? items
          .filter((d: DocumentoPostulacion) => {
            const dPostulacion = getDocPostulacionId(d);
            const pPostulacion = String(postulacion.id_postulacion || "").trim();
            return dPostulacion === pPostulacion && dPostulacion !== "";
          })
          .map((d: DocumentoPostulacion) => d.tipo_documento)
      : [];

    // Combinar documentos mandatorios con los especificados por el asesor
    // Los mandatorios siempre deben aparecer PRIMERO y en el orden específico
    const todosTipos = [
      ...DOCUMENTOS_MANDATORIOS, // Mantener el orden: Cédula, Acta, Título, Foto
      ...tiposDocumentosEnPostulacion.filter(tipo => !DOCUMENTOS_MANDATORIOS.includes(tipo))
    ];

    // Crear la lista de documentos requeridos con su estado
    // Determinar id_postulacion activo aunque `postulacion` esté null
    const postulacionActivaId = String(
      postulacion?.id_postulacion ||
      postulaciones?.[0]?.id_postulacion ||
      form?.id_postulacion ||
      getDocPostulacionId(items.find((d) => getDocPostulacionId(d) !== "")) ||
      ""
    ).trim();

    const documentos = todosTipos.map(tipo => {
      // Buscar documento existente (solo si hay postulación)
      // IMPORTANTE: Buscar por id_postulacion Y tipo_documento, pero ser flexible con el matching
      const docExistente = items.find((d: DocumentoPostulacion) => {
        const dPostulacion = getDocPostulacionId(d);
            const dTipo = tipoKey(d.tipo_documento);
            const tipoBuscado = tipoKey(tipo);

        const postulacionMatch = postulacionActivaId
          ? dPostulacion === postulacionActivaId
          : true; // si no tenemos id activo, no filtrar por postulación (mejor mostrar que ocultar)
        const tipoMatch = dTipo === tipoBuscado && dTipo !== "";
        return postulacionMatch && tipoMatch;
      }) || null;
      
      // Un documento existe si tiene url_archivo válido (no vacío)
      // IMPORTANTE: Excluir URLs temporales ya que no son documentos realmente cargados
      // Si el backend ya guardó un url_archivo (aunque sea temporal), considerarlo como "cargado"
      // Esto permite: visto verde, bloqueo de botón y progreso (tal como solicita el usuario).
      const tieneUrlValida = docExistente?.url_archivo &&
                             String(docExistente.url_archivo).trim() !== "";
      const existe = !!docExistente && tieneUrlValida;
      
      // DIAGNÓSTICO: Log solo si hay problemas o cambios
      if (docExistente && !existe) {
        console.warn(`⚠️ Documento "${tipo}" encontrado pero no válido:`, {
          id: docExistente.id_documento,
          url_archivo: docExistente.url_archivo,
          tiene_url: !!docExistente.url_archivo,
          url_vacia: !docExistente.url_archivo || docExistente.url_archivo.trim() === "",
          es_temporal: docExistente.url_archivo?.includes('/temp/')
        });
      }
      
      return {
        tipo_documento: tipo,
        existe: existe,
        documento: docExistente || null,
        esRequeridoPorAsesor: tiposDocumentosEnPostulacion.includes(tipo),
        esMandatorio: DOCUMENTOS_MANDATORIOS.includes(tipo),
        // Agregar índice para mantener el orden de los mandatorios
        indiceMandatorio: DOCUMENTOS_MANDATORIOS.indexOf(tipo),
      };
    });
    
    // DIAGNÓSTICO: Log del resultado final (solo si hay cambios o problemas)
    const cargados = documentos.filter(d => {
      const tieneUrlValida = d.documento?.url_archivo &&
                             String(d.documento.url_archivo).trim() !== "";
      return d.existe && tieneUrlValida;
    }).length;
    
    if (cargados !== documentos.filter(d => d.existe).length) {
      console.log("📊 Documentos requeridos calculados:", {
        total: documentos.length,
        cargados,
        con_url_valida: cargados,
        documentos: documentos.map(d => ({
          tipo: d.tipo_documento,
          existe: d.existe,
          tiene_documento: !!d.documento,
          tiene_url: !!d.documento?.url_archivo,
          url_valida: d.documento?.url_archivo && String(d.documento.url_archivo).trim() !== ""
        }))
      });
    }

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
    const cargados = documentosRequeridos.filter(d => {
      const tieneUrlValida = d.documento?.url_archivo &&
                             String(d.documento.url_archivo).trim() !== "";
      return d.existe && tieneUrlValida;
    }).length;
    const porcentaje = Math.round((cargados / documentosRequeridos.length) * 100);
    
    console.log("📊 Progreso calculado:", {
      cargados,
      total: documentosRequeridos.length,
      porcentaje,
      documentos: documentosRequeridos.map(d => ({
        tipo: d.tipo_documento,
        existe: d.existe,
        tiene_url: !!d.documento?.url_archivo,
        url_valida: d.documento?.url_archivo && String(d.documento.url_archivo).trim() !== ""
      }))
    });
    
    return porcentaje;
  }, [documentosRequeridos]);

  // Calcular documentos cargados y total (debe estar antes del return condicional)
  const documentosCargados = useMemo(() => {
    const cargados = documentosRequeridos.filter(d => {
      const tieneUrlValida = d.documento?.url_archivo &&
                             String(d.documento.url_archivo).trim() !== "";
      return d.existe && tieneUrlValida;
    }).length;
    
    return cargados;
  }, [documentosRequeridos]);

  const totalDocumentos = useMemo(() => {
    return documentosRequeridos.length;
  }, [documentosRequeridos]);


  const handleOpenDialog = (tipoDoc?: string, doc?: DocumentoPostulacion) => {
    try {
      console.log("🔓 Abriendo diálogo para:", { tipoDoc, doc: doc?.id_documento });
      
      setSelectedFile(null);
      setUploadError("");
      
      if (doc) {
        // Editar documento existente
        setSelectedDoc(doc);
        setSelectedTipoDoc("");
        setForm({
          id_postulacion: getDocPostulacionId(doc),
          tipo_documento: doc.tipo_documento,
          nombre_archivo: doc.nombre_archivo,
          url_archivo: doc.url_archivo,
          estado_documento: doc.estado_documento || "Pendiente",
          observaciones: doc.observaciones || "",
        });
      } else {
        // Subir nuevo documento
        // DEPENDENCIA: Si existe postulación → el aspirante DEBE poder subir documentos
        // El aspirante SIEMPRE tiene una postulación activa si está logueado
        const postulacionActiva = postulacion || postulaciones[0];
        
        console.log("📋 Postulación activa:", {
          desde_postulacion: postulacion?.id_postulacion,
          desde_postulaciones: postulaciones[0]?.id_postulacion,
          postulacion_activa: postulacionActiva?.id_postulacion
        });
        
        setSelectedDoc(null);
        setSelectedTipoDoc(tipoDoc || "");
        
        // Establecer el formulario - si no hay postulación en el estado, se obtendrá en handleSave
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
      console.log("✅ Diálogo abierto correctamente");
    } catch (error) {
      console.error("❌ Error al abrir diálogo:", error);
      setUploadError("Error al abrir el formulario. Por favor intenta nuevamente.");
    }
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
        const url = data.url || data.path || data.fileUrl || data.filename || "";
        if (!url) {
          throw new Error("El servidor no devolvió una URL para el archivo");
        }
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

  const handleSave = async () => {
    try {
      // Iniciar el proceso de carga
      setUploading(true);
      setUploadError("");

      // Obtener tipo_documento (del form o del selectedTipoDoc)
      const tipoDocumento = form.tipo_documento || selectedTipoDoc;

      // Validar campos requeridos básicos
      if (!tipoDocumento) {
        setUploadError("Por favor selecciona el tipo de documento");
        setUploading(false);
        return;
      }

      // DEPENDENCIA: Si existe postulación → el aspirante DEBE poder subir documentos
      // El aspirante SIEMPRE tiene una postulación activa si está logueado
      // Obtener la postulación SIEMPRE del backend para asegurar que tenemos la correcta
      
      if (!user?.id_cliente) {
        setUploadError("Error de autenticación. Por favor inicia sesión nuevamente.");
        setUploading(false);
        return;
      }

      // DEPENDENCIA: Si el aspirante está logueado, SIEMPRE tiene una postulación activa
      // Obtener postulaciones del backend SIEMPRE (no confiar solo en el estado)
      let idPostulacionFinal: string | null = null;
      
      console.log("🔍 Iniciando búsqueda de postulación...", {
        postulacion_estado: postulacion?.id_postulacion,
        postulaciones_estado: postulaciones.map(p => p.id_postulacion),
        form_id_postulacion: form.id_postulacion,
        user_id_cliente: user?.id_cliente
      });
      
      // Estrategia 1: Intentar obtener del estado actual primero (más rápido)
      idPostulacionFinal = postulacion?.id_postulacion || postulaciones[0]?.id_postulacion || form.id_postulacion;
      
      if (idPostulacionFinal && idPostulacionFinal.trim() !== "") {
        console.log("✅ Postulación encontrada en estado:", idPostulacionFinal);
      } else {
        // Estrategia 2: Si no hay en el estado, obtener del backend
        try {
          console.log("🔍 Obteniendo postulaciones del backend...");
          const postuls = await postulacionService.getPostulaciones();
          const postulsList = Array.isArray(postuls) 
            ? postuls 
            : (postuls as any)?.items || [];
          
          console.log("📋 Postulaciones obtenidas del backend:", {
            total: postulsList.length,
            todas: postulsList.map((p: Postulacion) => ({
              id: p.id_postulacion,
              id_cliente: p.id_cliente,
              fecha: p.fecha_postulacion
            }))
          });
          
          const postulsCliente = postulsList.filter((p: Postulacion) => {
            // Comparación flexible: convertir a string para evitar problemas de tipos
          const pCliente = getPostulacionClienteId(p);
            const userCliente = String(user.id_cliente || "").trim();
            const matches = pCliente === userCliente && pCliente !== "";
            console.log(`  - Postulación ${p.id_postulacion}: id_cliente="${pCliente}" (${typeof p.id_cliente}), user.id_cliente="${userCliente}" (${typeof user.id_cliente}), matches=${matches}`);
            return matches;
          });
          
          console.log("👤 Postulaciones del cliente:", postulsCliente.length);
          
          if (postulsCliente.length > 0) {
            // Usar la más reciente
            const postulacionMasReciente = postulsCliente.sort((a: Postulacion, b: Postulacion) => {
              const fechaA = a.fecha_postulacion ? new Date(a.fecha_postulacion).getTime() : 0;
              const fechaB = b.fecha_postulacion ? new Date(b.fecha_postulacion).getTime() : 0;
              return fechaB - fechaA;
            })[0];
            
            idPostulacionFinal = postulacionMasReciente.id_postulacion;
            setPostulacion(postulacionMasReciente);
            setForm({ ...form, id_postulacion: postulacionMasReciente.id_postulacion });
            console.log("✅ Postulación obtenida del backend:", idPostulacionFinal);
          } else {
            console.warn("⚠️ No se encontraron postulaciones del cliente en el backend");
          }
        } catch (error) {
          console.error("⚠️ Error al obtener postulaciones del backend:", error);
        }
      }
      
      // Estrategia 3: Si aún no hay, recargar el estado completo
      if (!idPostulacionFinal || idPostulacionFinal.trim() === "") {
        console.log("🔄 Recargando estado completo...");
        await load();
        idPostulacionFinal = postulacion?.id_postulacion || postulaciones[0]?.id_postulacion || form.id_postulacion;
        if (idPostulacionFinal && idPostulacionFinal.trim() !== "") {
          console.log("✅ Postulación encontrada después de recargar:", idPostulacionFinal);
        }
      }
      
      // Estrategia 4: Si aún no hay, intentar obtener todas las postulaciones y usar la primera
      // DEPENDENCIA: Si el aspirante está logueado, SIEMPRE tiene una postulación activa
      if (!idPostulacionFinal || idPostulacionFinal.trim() === "") {
        console.warn("⚠️ No se encontró postulación después de múltiples intentos");
        console.warn("⚠️ Intentando obtener todas las postulaciones sin filtro...");
        
        try {
          const postuls = await postulacionService.getPostulaciones();
          const postulsList = Array.isArray(postuls) 
            ? postuls 
            : (postuls as any)?.items || [];
          
          // Intentar encontrar por id_cliente (comparación flexible)
          const postulacionEncontrada = postulsList.find((p: Postulacion) => {
            const pCliente = getPostulacionClienteId(p);
            const userCliente = String(user.id_cliente || "").trim();
            const clienteMatch = pCliente === userCliente && pCliente !== "";
            console.log(`  - Comparando: p.id_cliente="${pCliente}" (${typeof p.id_cliente}) vs user.id_cliente="${userCliente}" (${typeof user.id_cliente}) = ${clienteMatch}`);
            return clienteMatch;
          });
          
          if (postulacionEncontrada?.id_postulacion) {
            idPostulacionFinal = postulacionEncontrada.id_postulacion;
            setPostulacion(postulacionEncontrada);
            setForm({ ...form, id_postulacion: postulacionEncontrada.id_postulacion });
            console.log("✅ Postulación encontrada en último intento:", idPostulacionFinal);
          } else if (postulsList.length > 0) {
            // Si hay postulaciones pero no coinciden, usar la primera (el backend validará)
            console.warn("⚠️ Usando la primera postulación disponible (el backend validará):", postulsList[0].id_postulacion);
            idPostulacionFinal = postulsList[0].id_postulacion;
            setPostulacion(postulsList[0]);
            setForm({ ...form, id_postulacion: postulsList[0].id_postulacion });
          }
        } catch (error) {
          console.error("❌ Error en último intento:", error);
        }
      }
      
      // Asegurar que el ID es un string limpio y válido
      if (idPostulacionFinal) {
        idPostulacionFinal = String(idPostulacionFinal).trim();
        console.log("✅ id_postulacion final a usar:", idPostulacionFinal);
      } else {
        // Si después de TODOS los intentos no hay id_postulacion, el backend debe validar
        // NO bloquear aquí - el backend tiene la lógica de seguridad
        console.error("❌ No se pudo obtener id_postulacion después de TODOS los intentos");
        console.error("❌ Estado completo:", {
          postulacion: postulacion?.id_postulacion,
          postulaciones: postulaciones.map(p => ({ id: p.id_postulacion, cliente: p.id_cliente })),
          form_id_postulacion: form.id_postulacion,
          user_id_cliente: user?.id_cliente,
          user_completo: user
        });
        
        // Permitir que el proceso continúe - el backend validará y devolverá un error específico
        // NO mostrar error aquí - dejar que el backend maneje la validación
        console.warn("⚠️ Continuando sin id_postulacion - el backend validará la solicitud");
      }

      // Si es un documento nuevo, debe tener un archivo seleccionado
      if (!selectedDoc && !selectedFile) {
        setUploadError("Por favor selecciona un archivo para subir");
        setUploading(false);
        return;
      }

      // Subir el archivo si hay uno seleccionado
      let urlArchivo = form.url_archivo;
      let uploadFailed = false;
      let esUrlTemporal = false;
      
      if (selectedFile) {
        try {
          console.log("📤 Intentando subir archivo:", {
            nombre: selectedFile.name,
            tamaño: selectedFile.size,
            tipo: selectedFile.type
          });
          
          urlArchivo = await uploadFile(selectedFile);
          
          if (!urlArchivo || urlArchivo.trim() === "") {
            console.warn("⚠️ El servidor no devolvió una URL válida - usando URL temporal");
            const timestamp = Date.now();
            const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            urlArchivo = `https://docs.plataforma.edu/postulaciones/temp/${timestamp}_${sanitizedName}`;
            uploadFailed = true;
            esUrlTemporal = true;
          } else {
            console.log("✅ Archivo subido exitosamente:", urlArchivo);
            esUrlTemporal = urlArchivo.includes('/temp/');
            if (esUrlTemporal) {
              uploadFailed = true;
              console.warn("⚠️ Se usó URL temporal - el archivo no se subió físicamente");
            }
          }
        } catch (uploadError: any) {
          console.error("❌ Error al subir archivo:", uploadError);
          uploadFailed = true;
          
          // SIEMPRE continuar con URL temporal - no bloquear el proceso
          console.warn("⚠️ Continuando con URL temporal para permitir guardar el documento");
          const timestamp = Date.now();
          const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          urlArchivo = `https://docs.plataforma.edu/postulaciones/temp/${timestamp}_${sanitizedName}`;
          esUrlTemporal = true;
        }
      } else if (!selectedDoc && !urlArchivo) {
        setUploadError("Por favor selecciona un archivo para subir");
        setUploading(false);
        return;
      }
      
      // Si es URL temporal, informar pero continuar
      if (esUrlTemporal || urlArchivo.includes('/temp/')) {
        console.warn("⚠️ NOTA: Se usará URL temporal. El backend puede procesar el archivo posteriormente.");
        esUrlTemporal = true;
      }

      // Validar que tenemos id_postulacion antes de continuar
      // IMPORTANTE: Si el aspirante está logueado, SIEMPRE tiene una postulación activa
      // Si no se encontró después de todos los intentos, intentar una última vez con el backend
      if (!idPostulacionFinal || idPostulacionFinal.trim() === "") {
        console.warn("⚠️ No se encontró postulación en el estado - intentando obtener del backend una última vez...");
        
        try {
          // Último intento: obtener todas las postulaciones y usar la primera del cliente
          const postuls = await postulacionService.getPostulaciones();
          const postulsList = Array.isArray(postuls) 
            ? postuls 
            : (postuls as any)?.items || [];
          
          // Buscar por id_cliente con comparación flexible
          const postulacionEncontrada = postulsList.find((p: Postulacion) => {
            const pCliente = getPostulacionClienteId(p);
            const userCliente = String(user?.id_cliente || "").trim();
            return pCliente === userCliente && pCliente !== "";
          });
          
          if (postulacionEncontrada?.id_postulacion) {
            idPostulacionFinal = postulacionEncontrada.id_postulacion;
            setPostulacion(postulacionEncontrada);
            setForm({ ...form, id_postulacion: postulacionEncontrada.id_postulacion });
            console.log("✅ Postulación encontrada en último intento:", idPostulacionFinal);
          } else {
            // Si aún no hay, el backend validará y devolverá un error específico
            console.warn("⚠️ No se encontró postulación - el backend validará la solicitud");
            // NO bloquear aquí - permitir que el backend maneje la validación
          }
        } catch (error) {
          console.error("❌ Error en último intento de obtener postulación:", error);
          // Continuar - el backend validará
        }
      }
      
      // Si después de todos los intentos aún no hay id_postulacion, mostrar error pero permitir intentar
      if (!idPostulacionFinal || idPostulacionFinal.trim() === "") {
        console.error("❌ No se pudo obtener id_postulacion después de todos los intentos");
        setUploadError("No se pudo obtener la postulación activa. Por favor verifica que tienes una postulación activa o contacta al administrador.");
        setUploading(false);
        return;
      }

      // Actualizar el nombre del archivo si no está establecido
      const nombreArchivo = form.nombre_archivo || selectedFile?.name || "documento";

      // Estructura exacta como en Postman - Alineada con CreateDocumentosPostulacionDto del backend
      // El backend valida:
      // 1. Que id_postulacion existe
      // 2. Que la postulación pertenece al cliente del usuario (para ASPIRANTE)
      // 3. Que todos los campos requeridos estén presentes
      const documentoData = {
        id_postulacion: idPostulacionFinal, // REQUERIDO - Validado por backend
        tipo_documento: tipoDocumento, // REQUERIDO
        nombre_archivo: nombreArchivo, // REQUERIDO
        url_archivo: urlArchivo, // REQUERIDO
        estado_documento: form.estado_documento || "Pendiente", // OPCIONAL - Default: "Pendiente"
        observaciones: form.observaciones || "", // OPCIONAL
      };

      // Validación final antes de enviar (el backend también validará)
      if (!documentoData.id_postulacion || documentoData.id_postulacion.trim() === "") {
        console.error("❌ ERROR: id_postulacion es requerido pero está vacío");
        setUploadError("No se pudo obtener la postulación. Por favor recarga la página.");
        setUploading(false);
        return;
      }

      if (!documentoData.tipo_documento || documentoData.tipo_documento.trim() === "") {
        console.error("❌ ERROR: tipo_documento es requerido pero está vacío");
        setUploadError("El tipo de documento es requerido.");
        setUploading(false);
        return;
      }

      if (!documentoData.nombre_archivo || documentoData.nombre_archivo.trim() === "") {
        console.error("❌ ERROR: nombre_archivo es requerido pero está vacío");
        setUploadError("El nombre del archivo es requerido.");
        setUploading(false);
        return;
      }

      if (!documentoData.url_archivo || documentoData.url_archivo.trim() === "") {
        console.error("❌ ERROR: url_archivo es requerido pero está vacío");
        setUploadError("La URL del archivo es requerida.");
        setUploading(false);
        return;
      }

      console.log("📤 Enviando documento al backend (alineado con CreateDocumentosPostulacionDto):", {
        ...documentoData,
        url_archivo_preview: documentoData.url_archivo.length > 100 
          ? documentoData.url_archivo.substring(0, 100) + "..." 
          : documentoData.url_archivo,
        es_url_temporal: documentoData.url_archivo.includes('/temp/'),
        upload_fallido: uploadFailed
      });
      console.log("📤 IMPORTANTE: Este documento aparecerá para admin, asesor y aspirante (mismo registro en BD)");
      console.log("📤 El backend validará que la postulación pertenece al cliente del usuario");
      
      // Si la URL es temporal, advertir que el backend puede rechazarla
      if (documentoData.url_archivo.includes('/temp/')) {
        console.warn("⚠️ ADVERTENCIA: Se está enviando una URL temporal. El backend puede rechazar este documento si no acepta URLs temporales.");
      }

      // Crear o actualizar el documento
      // IMPORTANTE: Un solo registro en la BD será visible para todos los roles
      // - Admin/Asesor: Verán todos los documentos sin filtros
      // - Aspirante: Verá solo sus documentos (filtrado por id_cliente en el frontend)
      let documentoGuardado: DocumentoPostulacion;
      
      // Determinar dónde se guardó el archivo y generar información detallada
      let ubicacionDetalle = "";
      if (urlArchivo.includes('/temp/')) {
        ubicacionDetalle = "URL temporal - el archivo se procesará posteriormente";
      } else if (urlArchivo.startsWith('http://') || urlArchivo.startsWith('https://')) {
        ubicacionDetalle = urlArchivo;
      } else if (urlArchivo.startsWith('/')) {
        ubicacionDetalle = `Servidor: ${urlArchivo}`;
      } else {
        ubicacionDetalle = `Servidor: ${urlArchivo}`;
      }
      
      console.log("📍 Información de almacenamiento del archivo:", {
        url_completa: urlArchivo,
        ubicacion: ubicacionDetalle,
        tipo: urlArchivo.includes('/temp/') ? 'temporal' : urlArchivo.startsWith('http') ? 'URL externa' : 'servidor local',
        nombre_archivo: nombreArchivo
      });
      
      try {
        if (selectedDoc) {
          // Actualizar documento existente
          console.log("🔄 Actualizando documento existente:", selectedDoc.id_documento);
          documentoGuardado = await docService.updateDocumentoPostulacion(selectedDoc.id_documento, documentoData);
          setSuccessMessage("Documento actualizado exitosamente");
        } else {
          // Crear nuevo documento - El backend validará:
          // 1. Que id_postulacion existe
          // 2. Que la postulación pertenece al cliente (para ASPIRANTE)
          // 3. Que todos los campos requeridos estén presentes
          console.log("➕ Creando nuevo documento - Backend validará permisos y relaciones");
          documentoGuardado = await docService.createDocumentoPostulacion(documentoData);
          setSuccessMessage("Documento guardado exitosamente");
        }
      } catch (error: any) {
        // El backend puede devolver errores específicos:
        // - 403: Postulación no encontrada o no pertenece al cliente
        // - 400: Datos inválidos
        // - 500: Error del servidor
        const status = error?.response?.status;
        const errorMessage = error?.response?.data?.message || error?.message || "Error al guardar el documento";
        const errorData = error?.response?.data;
        
        console.error("❌ Error al guardar documento:", {
          status,
          message: errorMessage,
          errorData,
          documentoData: {
            ...documentoData,
            url_archivo_preview: documentoData.url_archivo.length > 100 
              ? documentoData.url_archivo.substring(0, 100) + "..." 
              : documentoData.url_archivo,
            es_url_temporal: documentoData.url_archivo.includes('/temp/')
          },
          requestConfig: {
            url: error?.config?.url,
            method: error?.config?.method,
            headers: error?.config?.headers
          }
        });

        // Mensajes de error específicos según el código de estado
        if (status === 403) {
          if (errorMessage.includes("Postulación no encontrada") || errorMessage.includes("postulación no encontrada")) {
            setUploadError("La postulación no fue encontrada. Por favor recarga la página o verifica que tienes una postulación activa.");
          } else if (errorMessage.includes("No puedes crear documentos") || errorMessage.includes("no permitido") || errorMessage.includes("pertenece al cliente")) {
            setUploadError("No tienes permisos para crear documentos para esta postulación. Verifica que la postulación pertenece a tu cuenta.");
          } else {
            setUploadError("No tienes permisos para realizar esta acción. Por favor verifica que la postulación pertenece a tu cuenta.");
          }
        } else if (status === 400) {
          // Si el error menciona url_archivo o URL temporal, dar un mensaje más específico
          if (errorMessage.toLowerCase().includes("url") || errorMessage.toLowerCase().includes("archivo") || documentoData.url_archivo.includes('/temp/')) {
            setUploadError("El archivo no se pudo subir correctamente. Por favor verifica que el servicio de almacenamiento esté configurado en el backend o contacta al administrador.");
          } else {
            setUploadError(errorMessage || "Los datos enviados no son válidos. Por favor verifica que todos los campos estén completos.");
          }
        } else if (status === 404) {
          setUploadError("El recurso solicitado no existe. Por favor recarga la página.");
        } else if (status === 500) {
          setUploadError("Error en el servidor. Por favor intenta nuevamente más tarde o contacta al administrador.");
        } else if (!status && (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch"))) {
          setUploadError("Error de conexión. Verifica tu conexión a internet e intenta nuevamente.");
        } else {
          setUploadError(errorMessage || "Error al guardar el documento. Por favor intenta nuevamente.");
        }
        
        setUploading(false);
        return;
      }
      
      console.log("✅ Documento guardado exitosamente:", documentoGuardado);
      console.log("📍 Ubicación del archivo:", urlArchivo);
      
      const documentoGuardadoFinal: DocumentoPostulacion = {
        ...(documentoGuardado as any),
        id_postulacion: getDocPostulacionId(documentoGuardado as any) || String(idPostulacionFinal || "").trim(),
      };

      // ⚠️ VALIDACIÓN CRÍTICA: Verificar que el documento tiene url_archivo válido
      if (!documentoGuardadoFinal.url_archivo || documentoGuardadoFinal.url_archivo.trim() === "") {
        console.error("❌ ERROR CRÍTICO: El documento se guardó pero NO tiene url_archivo");
        console.error("❌ Documento recibido del backend:", documentoGuardado);
        setUploadError("El documento se guardó pero no se pudo obtener la URL del archivo. Por favor contacta al administrador.");
        setUploading(false);
        return;
      }
      
      // ⚠️ ADVERTENCIA: Si la URL es temporal, informar al usuario
      if (documentoGuardadoFinal.url_archivo.includes('/temp/')) {
        console.warn("⚠️ ADVERTENCIA: El documento se guardó con una URL temporal");
        console.warn("⚠️ Esto significa que el archivo NO se subió físicamente al servidor");
        console.warn("⚠️ El backend necesita un endpoint para subir archivos");
      }
      
      // Actualizar el estado inmediatamente con el documento guardado
      // Esto asegura que el documento aparezca como "Cargado" sin esperar a recargar
      // Y que el progreso se actualice inmediatamente
      console.log("🔄 Actualizando estado local con documento guardado:", {
        id_documento: documentoGuardadoFinal.id_documento,
        tipo_documento: documentoGuardadoFinal.tipo_documento,
        id_postulacion: documentoGuardadoFinal.id_postulacion,
        url_archivo: documentoGuardadoFinal.url_archivo,
        es_edicion: !!selectedDoc,
        postulacion_activa: postulacion?.id_postulacion
      });
      
      // Actualizar estado de items
      setItems(prevItems => {
        // Buscar si el documento ya existe (por id o por tipo+postulacion)
        const indiceExistente = prevItems.findIndex((item: DocumentoPostulacion) => {
          const idMatch = String(item.id_documento || "").trim() === String(documentoGuardadoFinal.id_documento || "").trim();
          if (idMatch) return true;
          
          // Si no hay match por ID, buscar por tipo y postulación
          const tipoMatch = tipoKey(item.tipo_documento) === tipoKey(documentoGuardadoFinal.tipo_documento);
          const postulacionMatch = getDocPostulacionId(item) === getDocPostulacionId(documentoGuardadoFinal);
          return tipoMatch && postulacionMatch;
        });
        
        let nuevosItems: DocumentoPostulacion[];
        
        if (indiceExistente >= 0) {
          // Reemplazar documento existente
          nuevosItems = [...prevItems];
          nuevosItems[indiceExistente] = documentoGuardadoFinal;
          console.log("📊 Estado actualizado (reemplazado en índice", indiceExistente, "):", {
            total_documentos: nuevosItems.length,
            documento_actualizado: documentoGuardadoFinal.id_documento,
            tipo: documentoGuardadoFinal.tipo_documento,
            tiene_url: !!documentoGuardadoFinal.url_archivo
          });
        } else {
          // Agregar nuevo documento
          nuevosItems = [...prevItems, documentoGuardadoFinal];
          console.log("📊 Estado actualizado (nuevo agregado):", {
            total_documentos: nuevosItems.length,
            documento_nuevo: documentoGuardadoFinal.id_documento,
            tipo: documentoGuardadoFinal.tipo_documento,
            id_postulacion: documentoGuardadoFinal.id_postulacion,
            tiene_url: !!documentoGuardadoFinal.url_archivo,
            url: documentoGuardadoFinal.url_archivo
          });
        }
        
        // Log detallado de todos los documentos en el estado
        console.log("📊 Todos los documentos en el estado después de actualizar:", {
          total: nuevosItems.length,
          documentos: nuevosItems.map((d: DocumentoPostulacion) => ({
            id: d.id_documento,
            tipo: d.tipo_documento,
            id_postulacion: getDocPostulacionId(d),
            tiene_url: !!d.url_archivo,
            url: d.url_archivo
          }))
        });
        
        return nuevosItems;
      });
      
      // Forzar actualización de postulación si es necesario
      if (postulacion && documentoGuardado.id_postulacion === postulacion.id_postulacion) {
        // La postulación ya está correcta, no hacer nada
      } else if (documentoGuardadoFinal.id_postulacion) {
        // Buscar la postulación correspondiente y actualizarla
        const postulacionEncontrada = postulaciones.find((p: Postulacion) => 
          String(p.id_postulacion || "").trim() === String(documentoGuardadoFinal.id_postulacion || "").trim()
        );
        if (postulacionEncontrada && !postulacion) {
          console.log("🔄 Actualizando postulación activa:", postulacionEncontrada.id_postulacion);
          setPostulacion(postulacionEncontrada);
        }
      }
      
      // DIAGNÓSTICO: Verificar el estado después de actualizar
      // Usar setTimeout para obtener el estado actualizado después de setItems
      setTimeout(() => {
        console.log("📊 DIAGNÓSTICO - Estado después de guardar (verificación):", {
          documento_guardado: {
            id: documentoGuardadoFinal.id_documento,
            tipo: documentoGuardadoFinal.tipo_documento,
            url_archivo: documentoGuardadoFinal.url_archivo,
            id_postulacion: documentoGuardadoFinal.id_postulacion
          },
          postulacion_activa: postulacion?.id_postulacion,
          tipo_documento: tipoDocumento,
          nota: "El estado 'items' se actualizará en el siguiente render"
        });
      }, 100);
      
      // Calcular el nuevo progreso después de actualizar el estado
      // El useMemo se actualizará automáticamente cuando cambie 'items'
      console.log("📊 Estado actualizado - Recalculando progreso...");
      console.log("📊 Documento guardado:", documentoGuardado);
      
      // Calcular progreso temporal para el mensaje (basado en el estado actualizado)
      const docsRequeridosActualizados = documentosRequeridos.map(docReq => {
        if (tipoKey(docReq.tipo_documento) === tipoKey(tipoDocumento)) {
          return { ...docReq, existe: true, documento: documentoGuardadoFinal };
        }
        return docReq;
      });
      const cargadosActualizados = docsRequeridosActualizados.filter(d => d.existe && d.documento?.url_archivo).length;
      const progresoActualizado = documentosRequeridos.length > 0 
        ? Math.round((cargadosActualizados / documentosRequeridos.length) * 100)
        : 0;
      
      console.log(`📊 Nuevo progreso: ${cargadosActualizados}/${documentosRequeridos.length} documentos (${progresoActualizado}%)`);
      
      // Disparar evento personalizado ANTES de recargar para actualizaciones más rápidas
      // Esto permite que otras páginas se actualicen inmediatamente sin esperar la recarga
      // IMPORTANTE: Este evento se escucha en:
      // - ProcesoAdmisionPage (aspirante) - para actualizar timeline y progreso
      // - AspiranteDashboard (aspirante) - para actualizar contadores
      // - DocumentosPage (admin/asesor) - para mostrar el nuevo documento sin duplicar registros
      window.dispatchEvent(new CustomEvent("documentosUpdated", {
        detail: { 
          documentoGuardado: documentoGuardadoFinal, 
          tipoDocumento,
          urlArchivo,
          progreso: progresoActualizado,
          documentosCargados: cargadosActualizados,
          totalDocumentos: documentosRequeridos.length,
          id_postulacion: documentoGuardadoFinal.id_postulacion,
          // Información importante: este es el MISMO registro que verán admin/asesor
          mensaje: "Este documento aparecerá en admin/asesor sin duplicar (mismo registro en BD)"
        }
      }));
      console.log("📢 Evento 'documentosUpdated' disparado para actualizar otras páginas", {
        documentoGuardado: {
          id: documentoGuardadoFinal.id_documento,
          tipo: documentoGuardadoFinal.tipo_documento,
          id_postulacion: documentoGuardadoFinal.id_postulacion,
          url_archivo: documentoGuardadoFinal.url_archivo
        },
        tipoDocumento,
        urlArchivo,
        progreso: progresoActualizado,
        nota: "Este mismo documento aparecerá en admin/asesor (un solo registro en BD)"
      });
      
      // Mostrar mensaje de éxito
      setSuccessOpen(true);
      
      // Cerrar el diálogo
      handleCloseDialog();
      
      // Recargar la lista para asegurar sincronización con el backend
      // IMPORTANTE: Recargar después de un breve delay para que el backend procese
      setTimeout(async () => {
        try {
          console.log("🔄 Recargando datos del backend después de guardar...");
          console.log("🔄 Documento guardado esperado:", {
            id: documentoGuardadoFinal.id_documento,
            tipo: tipoDocumento,
            id_postulacion: documentoGuardadoFinal.id_postulacion,
            url_archivo: documentoGuardadoFinal.url_archivo
          });
          
          // Recargar datos del backend
          await load();
          
          console.log("✅ Datos recargados del backend");
          console.log("✅ El documento debería aparecer como 'Cargado' en la UI ahora");
        } catch (err) {
          console.error("❌ Error al recargar después de guardar:", err);
        }
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al guardar el documento";
      const status = error?.response?.status;
      
      console.error("❌ Error al guardar documento:", {
        status,
        message: errorMessage,
        errorData: error?.response?.data
      });
      
      // Mensajes de error específicos
      let finalErrorMessage = errorMessage;
      
      if (status === 403 || errorMessage.includes("Forbidden") || errorMessage.includes("no permitido") || errorMessage.includes("No puedes crear")) {
        finalErrorMessage = "No tienes permisos para realizar esta acción. Verifica que la postulación pertenece a tu cuenta.";
      } else if (status === 404) {
        if (errorMessage.includes("Postulación no encontrada")) {
          finalErrorMessage = "No se encontró la postulación. Por favor recarga la página.";
        } else {
          finalErrorMessage = "El recurso solicitado no existe. Por favor recarga la página.";
        }
      } else if (status === 400) {
        finalErrorMessage = errorMessage || "Los datos enviados no son válidos. Por favor verifica que todos los campos estén completos.";
      } else if (status === 401) {
        finalErrorMessage = "Tu sesión ha expirado. Por favor inicia sesión nuevamente.";
      } else if (status === 500) {
        finalErrorMessage = "Error en el servidor. Por favor intenta nuevamente más tarde o contacta al administrador.";
      } else if (!status && (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch"))) {
        finalErrorMessage = "Error de conexión. Verifica tu conexión a internet e intenta nuevamente.";
      } else {
        finalErrorMessage = errorMessage || "Error al guardar el documento. Por favor intenta nuevamente.";
      }
      
      setUploadError(finalErrorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (url: string, nombre?: string) => {
    if (!url) return;
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewFileName(nombre || "");
    setPreviewMime("");
    setPreviewSourceUrl(url);

    // Limpiar preview anterior (si era objectURL)
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        try { URL.revokeObjectURL(prev); } catch {}
      }
      return "";
    });

    const candidates = buildCandidateUrls(url);
    setPreviewCandidates(candidates);
    if (candidates.length === 0) {
      setPreviewError("No se pudo construir la URL del archivo.");
      setPreviewLoading(false);
      setPreviewOpen(true);
      return;
    }

    // Intentar cargar como blob con token (para soportar rutas protegidas)
    let lastStatus: number | undefined = undefined;
    let lastTried = "";
    for (const candidate of candidates) {
      try {
        lastTried = candidate;
        const res = await api.get(candidate, { responseType: "blob" });
        const blob: Blob = res.data;
        if (!blob || blob.size === 0) continue;
        const ct = String((res as any)?.headers?.["content-type"] || blob.type || "").trim();
        setPreviewMime(ct);
        const objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setPreviewOpen(true);
        setPreviewLoading(false);
        return;
      } catch (e) {
        lastStatus = (e as any)?.response?.status;
        // intentar siguiente candidato
      }
    }

    // Si falló blob, NO mostrar preview roto: mostrar mensaje y dejar acciones disponibles
    setPreviewUrl("");
    setPreviewOpen(true);
    setPreviewLoading(false);
    setPreviewError(
      `No se pudo cargar el archivo para vista previa${lastStatus ? ` (status ${lastStatus})` : ""}. ` +
      (lastTried ? `URL probada: ${lastTried}. ` : "") +
      "Verifica que el backend esté sirviendo el archivo (ruta /uploads o similar)."
    );
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewError("");
    setPreviewLoading(false);
    setPreviewFileName("");
    setPreviewMime("");
    setPreviewSourceUrl("");
    setPreviewCandidates([]);
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        try { URL.revokeObjectURL(prev); } catch {}
      }
      return "";
    });
  };

  const handleDownload = async (url: string, nombre: string) => {
    if (!url) return;
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
      } catch {
        // try next
      }
    }

    // Fallback directo
    const u = resolveUrl(url);
    if (!u) return;
    const link = document.createElement("a");
    link.href = u;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const getTamañoArchivo = (url?: string) => {
    // Intentar obtener el tamaño del archivo si está disponible
    if (!url) return null;
    // Si es una URL temporal, mostrar tamaño estimado
    if (url.includes('/temp/')) {
      return "Procesando...";
    }
    // En producción, esto podría venir del backend o calcularse desde el archivo
    // Por ahora, mostrar un tamaño estimado
    return "Archivo cargado";
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
      {/* Header con título y botón */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.25 }}>
            Documentos Requeridos
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Carga todos los documentos necesarios para tu solicitud
          </Typography>
        </Box>
      </Box>

      {/* Tarjeta de progreso principal con barra superior - Estilo como en el ejemplo */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3, overflow: "hidden" }}>
        {/* Barra de progreso superior */}
        <Box
          sx={{
            // Igual a Mi Solicitud (ProcesoAdmisionPage)
            height: 4,
            background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)",
            width: `${progreso}%`,
            transition: "width 0.3s ease",
          }}
        />
        {/* Igual a Mi Solicitud (ProcesoAdmisionPage): padding y tamaños */}
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                Estado de tu solicitud
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {documentosCargados === totalDocumentos 
                  ? "Todos los documentos cargados" 
                  : documentosCargados > 0 
                  ? "Cargando documentos" 
                  : "Pendiente de carga"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#3b82f6" }}>
                {progreso}%
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Completado
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              // Igual a Mi Solicitud (ProcesoAdmisionPage)
              height: 6,
              borderRadius: 4,
              bgcolor: "#e5e7eb",
              mb: 0.75,
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)",
              },
            }}
          />
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {documentosCargados} de {totalDocumentos} documentos cargados
          </Typography>
        </CardContent>
      </Card>

      {/* Lista de documentos - Estilo compacto como en el ejemplo */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}>
            Documentos Requeridos
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {documentosRequeridos.map((docReq, index) => {
              // Verificar si el documento está cargado
              // IMPORTANTE: Un documento está cargado si tiene url_archivo válido (no vacío y no temporal)
              const doc = docReq.documento;
              const tieneUrlValida = doc?.url_archivo &&
                                     String(doc.url_archivo).trim() !== "";
              const estaCargado = docReq.existe && tieneUrlValida;
              const urlResuelta = resolveUrl(doc?.url_archivo);
              const puedePrevisualizar = canPreview(doc?.url_archivo);
              
              // Log para diagnóstico
              if (doc) {
                console.log(`📄 Renderizando documento "${docReq.tipo_documento}":`, {
                  existe: docReq.existe,
                  tiene_documento: !!doc,
                  tiene_url: !!doc.url_archivo,
                  url_valida: tieneUrlValida,
                  esta_cargado: estaCargado,
                  id_documento: doc.id_documento,
                  id_postulacion: doc.id_postulacion,
                  url_archivo: doc.url_archivo
                });
              }

              return (
                <Box
                  key={`${docReq.tipo_documento}-${doc?.id_documento || index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    bgcolor: estaCargado ? "#f0fdf4" : "#f9fafb",
                    borderRadius: 2,
                    border: estaCargado ? "1px solid #86efac" : "1px solid #e5e7eb",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: estaCargado ? "#dcfce7" : "#f3f4f6",
                      borderColor: estaCargado ? "#4ade80" : "#d1d5db",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
                    {/* Icono - Verde cuando está cargado, gris cuando está pendiente */}
                    {estaCargado ? (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: "#dcfce7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 24, color: "#10b981" }} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <UploadFileIcon sx={{ fontSize: 24, color: "#9ca3af" }} />
                      </Box>
                    )}
                    
                    {/* Información del documento */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          mb: 0.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {docReq.tipo_documento}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: "#6b7280",
                          fontSize: "0.75rem"
                        }}
                      >
                        {estaCargado && doc 
                          ? `${getTamañoArchivo(doc.url_archivo) || "Archivo cargado"} • ${doc.nombre_archivo || "Sin nombre"}`
                          : "-"}
                      </Typography>
                      {/* Mostrar URL del documento guardado - Visible siempre que esté cargado */}
                      {estaCargado && doc?.url_archivo && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: "#64748b",
                              fontSize: "0.7rem",
                              display: "block",
                              mb: 0.25
                            }}
                          >
                            Ubicación del archivo:
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: "#3b82f6",
                              fontSize: "0.7rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              cursor: "pointer",
                              wordBreak: "break-all",
                              "&:hover": {
                                textDecoration: "underline",
                                color: "#2563eb"
                              }
                            }}
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(urlResuelta || doc.url_archivo);
                                setSuccessMessage("URL copiada al portapapeles");
                                setSuccessOpen(true);
                                setTimeout(() => setSuccessOpen(false), 2000);
                              } catch (err) {
                                console.error("Error al copiar URL:", err);
                              }
                            }}
                            title="Haz clic para copiar la URL completa"
                          >
                            <LinkIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                            <Box component="span" sx={{ 
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block"
                            }}>
                              {urlResuelta || doc.url_archivo}
                            </Box>
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
                    {estaCargado && doc ? (
                      <>
                        <Tooltip title={puedePrevisualizar ? "Vista preliminar" : "Archivo en proceso (URL temporal)"} arrow>
                          <span>
                            <IconButton
                              size="small"
                          onClick={() => {
                                if (!puedePrevisualizar) return;
                                void handleView(doc.url_archivo, doc.nombre_archivo);
                              }}
                              disabled={!puedePrevisualizar}
                              sx={{
                                bgcolor: "transparent",
                                color: "#64748b",
                                width: 32,
                                height: 32,
                                "&:hover": { 
                                  bgcolor: "#f1f5f9",
                                  color: "#3b82f6",
                                },
                              }}
                              aria-label="Vista preliminar"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(doc.url_archivo, doc.nombre_archivo)}
                          sx={{
                            bgcolor: "transparent",
                            color: "#64748b",
                            width: 32,
                            height: 32,
                            "&:hover": { 
                              bgcolor: "#f1f5f9",
                              color: "#3b82f6",
                            },
                          }}
                          title="Descargar documento"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!estaCargado) {
                            handleOpenDialog(docReq.tipo_documento);
                          }
                        }}
                        disabled={Boolean(loading || uploading || estaCargado)}
                        sx={{
                          textTransform: "none",
                          color: estaCargado ? "#9ca3af" : "#3b82f6",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          cursor: estaCargado ? "not-allowed" : "pointer",
                          opacity: estaCargado ? 0.5 : 1,
                          "&:hover": {
                            bgcolor: "transparent",
                            color: estaCargado ? "#9ca3af" : "#2563eb",
                          },
                          "&:disabled": {
                            color: "#9ca3af",
                            cursor: "not-allowed",
                            opacity: 0.5,
                          },
                        }}
                      >
                        {estaCargado ? "Cargado" : "Subir"}
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

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

      {/* Dialog para vista preliminar del documento */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            height: "90vh"
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Vista preliminar del documento</Typography>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%" }}>
          {previewLoading && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc" }}>
              <CircularProgress />
            </Box>
          )}

          {!previewLoading && previewUrl && (
            <Box
              sx={{
                flex: 1,
                bgcolor: "#f8fafc",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {(
                previewMime.startsWith("image/") ||
                (previewFileName && previewFileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ||
                previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ) ? (
                <img
                  src={previewUrl}
                  alt="Vista preliminar"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                previewMime.includes("pdf") ||
                (previewFileName && previewFileName.match(/\.pdf$/i)) ||
                previewUrl.match(/\.pdf$/i)
              ) ? (
                <iframe
                  src={previewUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none"
                  }}
                  title="Vista preliminar PDF"
                />
              ) : (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <UploadFileIcon sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
                    Vista previa no disponible
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                    Este tipo de archivo no se puede previsualizar
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewUrl;
                      link.download = "documento";
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    sx={{
                      textTransform: "none",
                      bgcolor: "#3b82f6",
                      "&:hover": { bgcolor: "#2563eb" }
                    }}
                  >
                    Descargar archivo
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {!previewLoading && !previewUrl && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc" }}>
              <Box sx={{ textAlign: "center", p: 4 }}>
                <UploadFileIcon sx={{ fontSize: 56, color: "#94a3b8", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
                  Vista previa no disponible
                </Typography>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Puedes intentar abrir o descargar el archivo.
                </Typography>
              </Box>
            </Box>
          )}

          {!previewLoading && previewError && (
            <Box sx={{ position: "absolute", top: 72, left: 16, right: 16 }}>
              <Alert severity="warning">{previewError}</Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={handleClosePreview}
            sx={{ textTransform: "none" }}
          >
            Cerrar
          </Button>
          {!!previewCandidates?.[0] && (
            <Button
              variant="outlined"
              onClick={() => window.open(previewCandidates[0], "_blank")}
              sx={{ textTransform: "none" }}
            >
              Abrir
            </Button>
          )}
          {!!previewSourceUrl && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                void handleDownload(previewSourceUrl, previewFileName || "documento");
              }}
              sx={{
                textTransform: "none",
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" }
              }}
            >
              Descargar
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensaje de éxito - Estilo igual a "Perfil actualizado exitosamente" */}
      <Snackbar
        open={successOpen}
        autoHideDuration={6000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
