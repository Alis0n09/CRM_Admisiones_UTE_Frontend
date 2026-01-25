import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, TextField, Avatar, Chip, Box, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
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
import * as matriculaService from "../../services/matricula.service";
import type { Postulacion } from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { BecaEstudiante } from "../../services/becaEstudiante.service";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
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
  const [openView, setOpenView] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [sel, setSel] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>(empty);
  const [clienteDetail, setClienteDetail] = useState<Cliente | null>(null);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [documentos, setDocumentos] = useState<DocumentoPostulacion[]>([]);
  const [becas, setBecas] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };
  const handleView = (row: Cliente) => { setSel(row); setOpenView(true); };
  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numero_identificacion || !form.origen) return;
    (sel ? s.updateCliente(sel.id_cliente, form) : s.createCliente(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };
  const loadClienteDetail = useCallback(async (clienteId: string) => {
    setLoadingDetail(true);
    try {
      const clienteCompleto = await s.getCliente(clienteId);
      setClienteDetail(clienteCompleto);
      const postuls = await postulacionService.getPostulaciones({
        id_cliente: clienteId,
        limit: 500,
      });
      const postulsList = Array.isArray(postuls)
        ? postuls
        : (postuls as any)?.items || [];
      setPostulaciones(postulsList);
      const docs = await documentoService.getDocumentosPostulacion();
      const docsList = Array.isArray(docs) ? docs : [];
      const postulacionIds = postulsList.map((p: Postulacion) => p.id_postulacion);
      const docsCliente = docsList.filter((d: DocumentoPostulacion) => 
        postulacionIds.includes(d.id_postulacion)
      );
      setDocumentos(docsCliente);
      const becasData = await becaService.getBecas({ limit: 100 });
      const becasList = (becasData as any)?.items || [];
      setBecas(becasList);
      try {
        const becasEstudiantes = await becaEstudianteService.getBecasEstudiantesByCliente(clienteId);
        if (becasEstudiantes && becasEstudiantes.length > 0) {
          const becaVigente = becasEstudiantes.find((be: BecaEstudiante) => be.estado === "Vigente") || becasEstudiantes[0];
          setBecaAsignada(becaVigente);
          setSelectedBecaId(becaVigente.id_beca || becaVigente.beca?.id_beca || "");
          setBecaForm({
            periodo_academico: becaVigente.periodo_academico || "",
            monto_otorgado: becaVigente.monto_otorgado || "",
            estado: becaVigente.estado || "Vigente",
          });
        } else {
          setBecaAsignada(null);
          setSelectedBecaId("");
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
    setOpenDetail(true);
    await loadClienteDetail(cliente.id_cliente);
  };
  useEffect(() => {
    carreraService.getCarreras({ limit: 200 }).then((r: any) => {
      setCarreras(r?.items ?? []);
    }).catch(() => setCarreras([]));
  }, []);
  useEffect(() => {
    if (openDetail && clienteDetail?.id_cliente) {
      loadClienteDetail(clienteDetail.id_cliente);
    }
  }, [openDetail]);
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Solo se permiten archivos PDF, JPG o PNG");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError("El archivo no puede ser mayor a 5 MB");
        return;
      }
      setSelectedFile(file);
      setUploadError("");
    }
  };
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setUploadError("Por favor selecciona un archivo");
      return;
    }
    if (!documentoForm.tipo_documento) {
      setUploadError("Por favor especifica el tipo de documento");
      return;
    }
    if (postulaciones.length === 0) {
      setUploadError("El aspirante no tiene postulaciones. Debe crear una postulación primero.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const urlArchivo = await uploadFile(selectedFile);
      const postulacionActiva = postulaciones[0];
      await documentoService.createDocumentoPostulacion({
        id_postulacion: postulacionActiva.id_postulacion,
        tipo_documento: documentoForm.tipo_documento,
        nombre_archivo: selectedFile.name,
        url_archivo: urlArchivo,
        estado_documento: "Pendiente",
        observaciones: documentoForm.observaciones || "",
      });
      const docs = await documentoService.getDocumentosPostulacion();
      const docsList = Array.isArray(docs) ? docs : [];
      const postulacionIds = postulaciones.map((p: Postulacion) => p.id_postulacion);
      const docsCliente = docsList.filter((d: DocumentoPostulacion) => 
        postulacionIds.includes(d.id_postulacion)
      );
      setDocumentos(docsCliente);
      setSelectedFile(null);
      setDocumentoForm({ tipo_documento: "", observaciones: "" });
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
      
      if (postulacionForm.estado_postulacion === "Aprobada") {
        try {
          const matriculas = await matriculaService.getMatriculas({ limit: 1000 });
          const matriculasList = (matriculas as any)?.items ?? [];
          const existeMatricula = matriculasList.some(
            (m: any) => 
              m.id_cliente === clienteDetail.id_cliente && 
              m.id_carrera === postulacionForm.id_carrera && 
              m.periodo_academico === postulacionForm.periodo_academico
          );
          
          if (!existeMatricula) {
            await matriculaService.createMatricula({
              id_cliente: clienteDetail.id_cliente,
              id_carrera: postulacionForm.id_carrera,
              periodo_academico: postulacionForm.periodo_academico,
              estado: "Activa",
              fecha_matricula: new Date().toISOString().split('T')[0],
            });
            alert("✅ Postulación creada y aprobada. Matrícula creada automáticamente.");
          } else {
            alert("✅ Postulación creada y aprobada. La matrícula ya existe para este período.");
          }
        } catch (matriculaError: any) {
          console.error("Error al crear matrícula automática:", matriculaError);
          alert(`⚠️ Postulación creada, pero hubo un error al crear la matrícula: ${matriculaError?.response?.data?.message || matriculaError?.message || "Error desconocido"}`);
        }
      }
      
      if (clienteDetail.id_cliente) {
        await loadClienteDetail(clienteDetail.id_cliente);
      }
      setPostulacionForm({
        id_carrera: "",
        periodo_academico: "",
        estado_postulacion: "Pendiente",
        observaciones: "",
      });
      setOpenPostulacionDialog(false);
    } catch (error: any) {
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
      if (becaAsignada && becaAsignada.id_beca_estudiante) {
        await becaEstudianteService.updateBecaEstudiante(becaAsignada.id_beca_estudiante, {
          id_beca: selectedBecaId,
          periodo_academico: becaForm.periodo_academico,
          monto_otorgado: becaForm.monto_otorgado,
          estado: becaForm.estado,
        });
      } else {
        await becaEstudianteService.createBecaEstudiante({
          id_beca: selectedBecaId,
          id_cliente: clienteDetail.id_cliente,
          periodo_academico: becaForm.periodo_academico,
          monto_otorgado: becaForm.monto_otorgado,
          estado: becaForm.estado,
          fecha_asignacion: new Date().toISOString().split('T')[0],
        });
      }
      if (clienteDetail.id_cliente) {
        await loadClienteDetail(clienteDetail.id_cliente);
      }
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
        onView={handleView}
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
      <ClienteViewModal open={openView} onClose={() => setOpenView(false)} cliente={sel} />
    </>
  );
}
