import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, TextField, Avatar, Chip, Box, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable, { type Column } from "../../components/DataTable";
import ClienteViewModal from "../../components/ClienteViewModal";
import * as s from "../../services/cliente.service";
import type { Cliente } from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";
import * as documentoService from "../../services/documentoPostulacion.service";
import * as becaService from "../../services/beca.service";
import * as becaEstudianteService from "../../services/becaEstudiante.service";
import * as carreraService from "../../services/carrera.service";
import type { Postulacion } from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { BecaEstudiante } from "../../services/becaEstudiante.service";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { api } from "../../services/api";

const cols: Column<Cliente>[] = [
  {
    id: "aspirante",
    label: "ASPIRANTE",
    minWidth: 250,
    format: (_, row: Cliente) => {
      const initials = `${row.nombres?.[0] || ""}${row.apellidos?.[0] || ""}`.toUpperCase();
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#3b82f6", width: 40, height: 40, fontSize: "0.875rem", fontWeight: 600 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {`${row.nombres || ""} ${row.apellidos || ""}`.trim()}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
              {row.correo || "-"}
            </Typography>
          </Box>
        </Stack>
      );
    },
  },
  { id: "numero_identificacion", label: "CÉDULA", minWidth: 120 },
  { id: "celular", label: "CELULAR", minWidth: 120 },
  {
    id: "estado",
    label: "ESTADO",
    minWidth: 100,
    format: (v: string) => (
      <Chip
        label={v || "Nuevo"}
        size="small"
        sx={{
          bgcolor: "#3b82f6",
          color: "white",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    ),
  },
];

const empty: Partial<Cliente> = { nombres: "", apellidos: "", tipo_identificacion: "Cédula", numero_identificacion: "", origen: "Web", estado: "Nuevo" };

export default function AsesorClientesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [sel, setSel] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>(empty);
  const [clienteDetail, setClienteDetail] = useState<Cliente | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoPostulacion[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedPostulacionId, setSelectedPostulacionId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedName, setUploadedName] = useState("");
  const [documentoForm, setDocumentoForm] = useState({
    tipo_documento: "",
    observaciones: "",
  });
  const [openPostulacionDialog, setOpenPostulacionDialog] = useState(false);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [postulacionForm, setPostulacionForm] = useState({
    id_carrera: "",
    periodo_academico: "",
    estado_postulacion: "Pendiente",
    observaciones: "",
  });
  const [openBecaDialog, setOpenBecaDialog] = useState(false);
  const [becaAsignada, setBecaAsignada] = useState<BecaEstudiante | null>(null);
  const [selectedBecaId, setSelectedBecaId] = useState("");
  const [becaForm, setBecaForm] = useState({
    periodo_academico: "",
    monto_otorgado: "",
    estado: "Vigente",
  });

  const currentPostulacionId = useMemo(() => {
    if (selectedPostulacionId) return selectedPostulacionId;
    return postulaciones[0]?.id_postulacion || "";
  }, [postulaciones, selectedPostulacionId]);

  // (estadoChip) ya no se usa aquí: el modal con diseño maneja chips.

  // Sincronizar el estado de búsqueda con el parámetro de la URL cuando cambia la URL
  useEffect(() => {
    const urlSearchParam = searchParams.get("search") || "";
    if (urlSearchParam !== search) {
      setSearch(urlSearchParam);
      setPage(1);
    }
  }, [searchParams]);

  const load = useCallback(() => {
    const currentSearch = searchParams.get("search") || search || "";
    const searchParam = currentSearch.trim();
    // Pasar el parámetro de búsqueda solo si tiene contenido
    const params: { page: number; limit: number; search?: string } = { page, limit };
    if (searchParam) {
      params.search = searchParam;
    }
    s.getClientes(params).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch((err) => {
      console.error("Error en búsqueda:", err);
      setItems([]);
      setTotal(0);
    });
  }, [page, limit, search, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    // Actualizar URL sin recargar la página
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numero_identificacion || !form.origen) return;
    
    if (sel) {
      // Actualizar: incluir todos los campos incluyendo estado
      s.updateCliente(sel.id_cliente, form)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    } else {
      // Crear: excluir el campo estado ya que el backend no lo acepta en la creación
      const { estado, ...formSinEstado } = form;
      s.createCliente(formSinEstado as any)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    }
  };

  const loadClienteDetail = useCallback(async (clienteId: string) => {
    setLoadingDetail(true);
    
    try {
      // Cargar información completa del cliente
      const clienteCompleto = await s.getCliente(clienteId);
      setClienteDetail(clienteCompleto);
  
      // Cargar postulaciones. El backend NO filtra por id_cliente en query (valida QueryDto),
      // así que traemos paginado normal y filtramos aquí por seguridad.
      const postuls = await postulacionService.getPostulaciones({
        page: 1,
        limit: 500,
      });
      // Soportar varias formas de respuesta y filtrar por seguridad
      const postulsListRaw = Array.isArray(postuls)
        ? postuls
        : (Array.isArray((postuls as any)?.items)
            ? (postuls as any).items
            : (Array.isArray((postuls as any)?.data?.items) ? (postuls as any).data.items : []));
      const postulsList = postulsListRaw.filter((p: any) =>
        p.id_cliente === clienteId || p?.cliente?.id_cliente === clienteId
      );
      setPostulaciones(postulsList);
  
      // Cargar documentos por postulación (endpoint directo del backend)
      if (postulsList.length === 0) {
        setDocumentos([]);
      } else {
        const docsByPost = await Promise.all(
          postulsList.map((p: Postulacion) =>
            documentoService.getDocumentosPorPostulacion(p.id_postulacion).catch(() => [])
          )
        );
        const flat = docsByPost.flat().filter(Boolean) as DocumentoPostulacion[];
        setDocumentos(flat);
      }
  
      // Cargar becas disponibles
      try {
        const becasData = await becaService.getBecas({ page: 1, limit: 100 });
        const becasList = Array.isArray(becasData) ? becasData : ((becasData as any)?.items ?? []);
        setBecas(becasList);
      } catch (e) {
        console.error("Error cargando becas:", e);
        setBecas([]);
      }
  
      // Cargar becas asignadas al cliente desde el endpoint correcto
      try {
        const becasEstudiantes = await becaEstudianteService.getBecasEstudiantesByCliente(clienteId);
        if (becasEstudiantes && becasEstudiantes.length > 0) {
          // Tomar la beca más reciente (o la vigente)
          const becaVigente = becasEstudiantes.find((be: BecaEstudiante) => be.estado === "Vigente") || becasEstudiantes[0];
          setBecaAsignada(becaVigente);
          setSelectedBecaId(becaVigente.id_beca || becaVigente.beca?.id_beca || "");
          // Prellenar el formulario con los datos existentes
          setBecaForm({
            periodo_academico: becaVigente.periodo_academico || "",
            monto_otorgado: becaVigente.monto_otorgado || "",
            estado: becaVigente.estado || "Vigente",
          });
        } else {
          setBecaAsignada(null);
          setSelectedBecaId("");
          // Resetear formulario
          const currentYear = new Date().getFullYear();
          setBecaForm({
            periodo_academico: `${currentYear}-1`,
            monto_otorgado: "",
            estado: "Vigente",
          });
        }
      } catch (error) {
        console.error("Error cargando becas asignadas:", error);
        setBecaAsignada(null);
        setSelectedBecaId("");
      }
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleViewDetail = async (cliente: Cliente) => {
    setClienteDetail(cliente);
    setSel(cliente);
    setOpenDetail(true);
    await loadClienteDetail(cliente.id_cliente);
  };

  // Cargar carreras al montar el componente
  useEffect(() => {
    carreraService.getCarreras({ limit: 200 }).then((r: any) => {
      setCarreras(r?.items ?? []);
    }).catch(() => setCarreras([]));
  }, []);

  // Recargar datos cuando se abre el diálogo
  useEffect(() => {
    if (openDetail && clienteDetail?.id_cliente) {
      loadClienteDetail(clienteDetail.id_cliente);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDetail]);

  const uploadFile = async (file: File): Promise<{ url: string; nombre_archivo: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const normalizeUploadedUrl = (rawUrl: string) => {
      const raw = String(rawUrl || "").trim();
      if (!raw) return "";
      if (/^https?:\/\//i.test(raw)) return raw;
      // si viene solo "archivo.pdf" o "/archivo.pdf", asumimos carpeta /uploads
      if (/^[^/]+\.[a-z0-9]+$/i.test(raw)) return `/uploads/${raw}`;
      if (/^\/[^/]+\.[a-z0-9]+$/i.test(raw)) return `/uploads/${raw.slice(1)}`;
      if (/^uploads\/[^/]+/i.test(raw)) return `/${raw}`;
      return raw;
    };
    
    try {
      // Intento 1: endpoint específico de documentos (como DocumentosPage)
      const { data } = await api.post("/documentos-postulacion/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Soportar respuestas envueltas tipo SuccessResponseDto { message, data: { url } }
      const payload = data?.data ?? data;
      // Tu backend devuelve: { url_archivo, url_segura, nombre_archivo, filename, ... }
      const urlRaw =
        payload?.url_segura ||
        payload?.url_archivo ||
        payload?.url ||
        payload?.path ||
        payload?.fileUrl ||
        payload?.filename ||
        "";
      const url = normalizeUploadedUrl(urlRaw);
      const nombre_archivo = String(payload?.nombre_archivo || file.name || "documento");
      if (!url) throw new Error("El servidor no devolvió una URL para el archivo");
      return { url, nombre_archivo };
    } catch (error1: any) {
      try {
        // Intento 2: endpoint genérico
        const { data } = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const payload = data?.data ?? data;
        const urlRaw =
          payload?.url_segura ||
          payload?.url_archivo ||
          payload?.url ||
          payload?.path ||
          payload?.fileUrl ||
          payload?.filename ||
          "";
        const url = normalizeUploadedUrl(urlRaw);
        const nombre_archivo = String(payload?.nombre_archivo || file.name || "documento");
        if (!url) throw new Error("El servidor no devolvió una URL para el archivo");
        return { url, nombre_archivo };
      } catch (error2: any) {
        // Fallback: URL temporal (permite guardar registro aunque no haya upload disponible)
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const tempUrl = `https://docs.plataforma.edu/postulaciones/temp/${timestamp}_${sanitizedName}`;
        console.warn("⚠️ Upload no disponible, usando URL temporal", { tempUrl, error1, error2 });
        return { url: tempUrl, nombre_archivo: file.name || "documento" };
      }
    }
  };

  const validatePickedFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) return "Solo se permiten archivos PDF, JPG o PNG";
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return "El archivo no puede ser mayor a 5 MB";
    return "";
  };

  const handleFilePicked = async (file: File) => {
    const err = validatePickedFile(file);
    if (err) {
      setUploadError(err);
      return;
    }

    setUploading(true);
    setUploadError("");
    setSelectedFile(file);
    setUploadedName(file.name);
    setUploadedUrl("");

    try {
      const res = await uploadFile(file);
      setUploadedUrl(res.url);
      setUploadedName(res.nombre_archivo);
      if (String(res.url).includes("/temp/")) {
        setUploadError("Upload no disponible: se usará URL temporal (no previsualizable).");
      }
    } catch (e: any) {
      setUploadError(e?.message || "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentoForm.tipo_documento) {
      setUploadError("Por favor especifica el tipo de documento");
      return;
    }
    if (postulaciones.length === 0) {
      setUploadError("El aspirante no tiene postulaciones. Debe crear una postulación primero.");
      return;
    }
    if (!uploadedUrl) {
      setUploadError("Primero selecciona un archivo para subir (o ingresa una URL).");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const id_postulacion = currentPostulacionId || postulaciones[0]?.id_postulacion;
      if (!id_postulacion) {
        setUploadError("No hay una postulación seleccionada");
        return;
      }
      
      await documentoService.createDocumentoPostulacion({
        id_postulacion,
        tipo_documento: documentoForm.tipo_documento,
        nombre_archivo: uploadedName || selectedFile?.name || "documento",
        url_archivo: uploadedUrl,
        estado_documento: "Pendiente",
        observaciones: documentoForm.observaciones || "",
      });

      // Recargar todo el detalle (misma lógica que DocumentosPage: guardar y refrescar)
      const clienteId = clienteDetail?.id_cliente || sel?.id_cliente;
      if (clienteId) await loadClienteDetail(clienteId);

      // Limpiar formulario
      setSelectedFile(null);
      setDocumentoForm({ tipo_documento: "", observaciones: "" });
      setSelectedPostulacionId("");
      setUploadedUrl("");
      setUploadedName("");
      setOpenUploadDialog(false);
    } catch (error: any) {
      setUploadError(error?.message || "Error al subir el documento");
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePostulacion = async () => {
    if (!postulacionForm.id_carrera || !postulacionForm.periodo_academico) {
      alert("Por favor completa la carrera y el período académico");
      return;
    }
    if (!clienteDetail) {
      alert("Error: No se ha seleccionado un cliente");
      return;
    }

    try {
      await postulacionService.createPostulacion({
        id_cliente: clienteDetail.id_cliente,
        id_carrera: postulacionForm.id_carrera,
        periodo_academico: postulacionForm.periodo_academico,
        estado_postulacion: postulacionForm.estado_postulacion,
        observaciones: postulacionForm.observaciones || "",
      });

      // Recargar datos del cliente
      const id = clienteDetail?.id_cliente || sel?.id_cliente;
      if (id) await loadClienteDetail(id);

      // Limpiar formulario y cerrar diálogo
      setPostulacionForm({
        id_carrera: "",
        periodo_academico: "",
        estado_postulacion: "Pendiente",
        observaciones: "",
      });
      setOpenPostulacionDialog(false);
    } catch (error: any) {
      console.error("Error creando postulación:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Error al crear la postulación");
    }
  };

  const handleSelectBeca = async () => {
    if (!selectedBecaId) {
      alert("Por favor selecciona una beca");
      return;
    }
    if (!clienteDetail) {
      alert("Error: No se ha seleccionado un cliente");
      return;
    }
    if (!becaForm.periodo_academico) {
      alert("Por favor ingresa el período académico");
      return;
    }
    if (!becaForm.monto_otorgado) {
      alert("Por favor ingresa el monto otorgado");
      return;
    }

    try {
      // Si ya existe una beca asignada, actualizarla; si no, crear una nueva
      if (becaAsignada && becaAsignada.id_beca_estudiante) {
        // Actualizar beca existente
        await becaEstudianteService.updateBecaEstudiante(becaAsignada.id_beca_estudiante, {
          id_beca: selectedBecaId,
          periodo_academico: becaForm.periodo_academico,
          monto_otorgado: becaForm.monto_otorgado,
          estado: becaForm.estado,
        });
      } else {
        // Crear nueva asignación de beca
        await becaEstudianteService.createBecaEstudiante({
          id_beca: selectedBecaId,
          id_cliente: clienteDetail.id_cliente,
          periodo_academico: becaForm.periodo_academico,
          monto_otorgado: becaForm.monto_otorgado,
          estado: becaForm.estado,
          fecha_asignacion: new Date().toISOString().split('T')[0],
        });
      }

      // Recargar datos del cliente
      const id = clienteDetail?.id_cliente || sel?.id_cliente;
      if (id) await loadClienteDetail(id);

      setOpenBecaDialog(false);
      alert("Beca asignada exitosamente");
    } catch (error: any) {
      console.error("Error al asignar beca:", error);
      alert(error?.response?.data?.message || "Error al asignar la beca. Verifica que todos los campos estén completos.");
    }
  };

  return (
    <>
      <DataTable
        title="Mis Aspirantes"
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
        onAdd={() => {
          setSel(null);
          setForm(empty);
          setOpen(true);
        }}
        onView={(r) => { void handleViewDetail(r); }}
        onEdit={(r) => {
          setSel(r);
          setForm({ ...r });
          setOpen(true);
        }}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar aspirantes..."
        getId={(r) => r.id_cliente}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Celular" value={form.celular ?? ""} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
          <TextField margin="dense" fullWidth label="Origen" value={form.origen ?? ""} onChange={(e) => setForm({ ...form, origen: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado ?? "Nuevo"} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Nuevo">Nuevo</MenuItem><MenuItem value="En proceso">En proceso</MenuItem><MenuItem value="Matriculado">Matriculado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>

      <ClienteViewModal
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setOpenUploadDialog(false);
          setOpenPostulacionDialog(false);
          setOpenBecaDialog(false);
          setSelectedFile(null);
          setUploadError("");
          setSelectedPostulacionId("");
        }}
        cliente={clienteDetail ?? sel}
        postulaciones={postulaciones}
        documentos={documentos}
        becasDisponibles={becas}
        becaAsignada={becaAsignada}
        loadingDetail={loadingDetail}
        onCrearPostulacionClick={() => {
          const currentYear = new Date().getFullYear();
          setPostulacionForm((p) => ({
            ...p,
            id_carrera: p.id_carrera || carreras[0]?.id_carrera || "",
            periodo_academico: p.periodo_academico || `${currentYear}-1`,
            estado_postulacion: p.estado_postulacion || "Pendiente",
          }));
          setOpenPostulacionDialog(true);
        }}
        onSubirDocumentoClick={() => {
          setUploadError("");
          setSelectedFile(null);
          setSelectedPostulacionId(postulaciones[0]?.id_postulacion || "");
          setOpenUploadDialog(true);
        }}
        onAsignarBecaClick={() => {
          if (!selectedBecaId && becas.length > 0) setSelectedBecaId((becas as any)[0]?.id_beca || "");
          setOpenBecaDialog(true);
        }}
      />

      {/* Crear postulación */}
      <Dialog open={openPostulacionDialog} onClose={() => setOpenPostulacionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva postulación</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            select
            label="Carrera"
            value={postulacionForm.id_carrera}
            onChange={(e) => setPostulacionForm({ ...postulacionForm, id_carrera: e.target.value })}
          >
            {carreras.map((c) => (
              <MenuItem key={c.id_carrera} value={c.id_carrera}>
                {c.nombre_carrera}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            fullWidth
            label="Período académico"
            value={postulacionForm.periodo_academico}
            onChange={(e) => setPostulacionForm({ ...postulacionForm, periodo_academico: e.target.value })}
            placeholder="2026-1"
          />
          <TextField
            margin="dense"
            fullWidth
            select
            label="Estado"
            value={postulacionForm.estado_postulacion}
            onChange={(e) => setPostulacionForm({ ...postulacionForm, estado_postulacion: e.target.value })}
          >
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="En revisión">En revisión</MenuItem>
            <MenuItem value="Aprobada">Aprobada</MenuItem>
            <MenuItem value="Rechazada">Rechazada</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            fullWidth
            label="Observaciones"
            multiline
            minRows={3}
            value={postulacionForm.observaciones}
            onChange={(e) => setPostulacionForm({ ...postulacionForm, observaciones: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPostulacionDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => { void handleCreatePostulacion(); }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subir documento */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir documento</DialogTitle>
        <DialogContent>
          {postulaciones.length > 0 && (
            <TextField
              margin="dense"
              fullWidth
              select
              label="Postulación"
              value={currentPostulacionId}
              onChange={(e) => setSelectedPostulacionId(e.target.value)}
            >
              {postulaciones.map((p) => (
                <MenuItem key={p.id_postulacion} value={p.id_postulacion}>
                  #{String(p.id_postulacion).slice(0, 8)} · {p.carrera?.nombre_carrera || String(p.id_carrera).slice(0, 8)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            margin="dense"
            fullWidth
            label="Tipo de documento"
            value={documentoForm.tipo_documento}
            onChange={(e) => setDocumentoForm({ ...documentoForm, tipo_documento: e.target.value })}
            placeholder="Ej: Cédula / Certificado / Foto"
          />
          <TextField
            margin="dense"
            fullWidth
            label="URL del archivo"
            value={uploadedUrl}
            onChange={(e) => setUploadedUrl(e.target.value)}
            placeholder="Se llena automáticamente al subir"
          />
          <TextField
            margin="dense"
            fullWidth
            label="Observaciones"
            value={documentoForm.observaciones}
            onChange={(e) => setDocumentoForm({ ...documentoForm, observaciones: e.target.value })}
          />
          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              disabled={uploading}
              sx={{ textTransform: "none" }}
            >
              {uploading ? "Subiendo..." : "Seleccionar y subir archivo"}
              <input
                hidden
                type="file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFilePicked(f);
                }}
              />
            </Button>
            {(uploadedName || selectedFile?.name) && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#64748b" }}>
                Archivo: {uploadedName || selectedFile?.name}
              </Typography>
            )}
            {uploadedUrl && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: "#64748b" }}>
                URL: {uploadedUrl}
              </Typography>
            )}
            {uploadError && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "#ef4444", fontWeight: 700 }}>
                {uploadError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
          <Button variant="contained" disabled={uploading} onClick={() => { void handleUploadDocument(); }}>
            Guardar documento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asignar beca */}
      <Dialog open={openBecaDialog} onClose={() => setOpenBecaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{becaAsignada ? "Actualizar beca" : "Asignar beca"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            fullWidth
            select
            label="Beca"
            value={selectedBecaId}
            onChange={(e) => setSelectedBecaId(e.target.value)}
          >
            {becas.map((b: any) => (
              <MenuItem key={b.id_beca} value={b.id_beca}>
                {b.nombre_beca} ({b.tipo_beca})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            fullWidth
            label="Período académico"
            value={becaForm.periodo_academico}
            onChange={(e) => setBecaForm({ ...becaForm, periodo_academico: e.target.value })}
          />
          <TextField
            margin="dense"
            fullWidth
            label="Monto otorgado"
            value={becaForm.monto_otorgado}
            onChange={(e) => setBecaForm({ ...becaForm, monto_otorgado: e.target.value })}
          />
          <TextField
            margin="dense"
            fullWidth
            select
            label="Estado"
            value={becaForm.estado}
            onChange={(e) => setBecaForm({ ...becaForm, estado: e.target.value })}
          >
            <MenuItem value="Vigente">Vigente</MenuItem>
            <MenuItem value="Inactiva">Inactiva</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBecaDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => { void handleSelectBeca(); }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
