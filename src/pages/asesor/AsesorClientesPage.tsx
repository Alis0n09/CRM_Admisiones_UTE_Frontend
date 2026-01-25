import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, TextField, Avatar, Box, Chip, Typography, Paper, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Card, CardContent, Input, Alert, FormControl, InputLabel, Select } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable, { type Column } from "../../components/DataTable";
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

function getInitials(nombres: string, apellidos: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("nuevo")) return "info";
  if (estadoLower.includes("proceso")) return "warning";
  if (estadoLower.includes("matriculado")) return "success";
  return "default";
}

const cols: Column<Cliente>[] = [
  { 
    id: "nombres", 
    label: "Aspirante", 
    minWidth: 200,
    format: (_, r) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#8b5cf6", width: 40, height: 40, fontSize: "0.875rem" }}>
          {getInitials(r.nombres, r.apellidos)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {r.nombres} {r.apellidos}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {r.correo || "Sin correo"}
          </Typography>
        </Box>
      </Box>
    )
  },
  { id: "numero_identificacion", label: "Cédula", minWidth: 120 },
  { id: "celular", label: "Celular", minWidth: 120 },
  { 
    id: "estado", 
    label: "Estado", 
    minWidth: 130,
    format: (v) => (
      <Chip 
        label={v || "Nuevo"} 
        size="small" 
        color={getEstadoColor(v) as any}
        sx={{ fontWeight: 600 }}
      />
    )
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
    (sel ? s.updateCliente(sel.id_cliente, form) : s.createCliente(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const loadClienteDetail = useCallback(async (clienteId: string) => {
    setLoadingDetail(true);
    
    try {
      // Cargar información completa del cliente
      const clienteCompleto = await s.getCliente(clienteId);
      setClienteDetail(clienteCompleto);
  
      // Cargar postulaciones del cliente. El backend filtra por id_cliente cuando se envía el parámetro
      const postuls = await postulacionService.getPostulaciones({
        id_cliente: clienteId,
        limit: 500,
      });
      // El backend ya filtra por id_cliente, confiamos en su respuesta
      const postulsList = Array.isArray(postuls)
        ? postuls
        : (postuls as any)?.items || [];
      setPostulaciones(postulsList);
  
      // Cargar documentos de las postulaciones
      const docs = await documentoService.getDocumentosPostulacion();
      const docsList = Array.isArray(docs) ? docs : [];
      const postulacionIds = postulsList.map((p: Postulacion) => p.id_postulacion);
      const docsCliente = docsList.filter((d: DocumentoPostulacion) => 
        postulacionIds.includes(d.id_postulacion)
      );
      setDocumentos(docsCliente);
  
      // Cargar becas disponibles
      const becasData = await becaService.getBecas({ limit: 100 });
      const becasList = (becasData as any)?.items || [];
      setBecas(becasList);
  
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

      // Recargar documentos
      const docs = await documentoService.getDocumentosPostulacion();
      const docsList = Array.isArray(docs) ? docs : [];
      const postulacionIds = postulaciones.map((p: Postulacion) => p.id_postulacion);
      const docsCliente = docsList.filter((d: DocumentoPostulacion) => 
        postulacionIds.includes(d.id_postulacion)
      );
      setDocumentos(docsCliente);

      // Limpiar formulario
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

      // Recargar datos del cliente
      if (clienteDetail.id_cliente) {
        await loadClienteDetail(clienteDetail.id_cliente);
      }

      // Limpiar formulario y cerrar diálogo
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
      <DataTable title="Mis Aspirantes" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onView={handleViewDetail}
        search={search} onSearchChange={handleSearchChange}
        getId={(r) => r.id_cliente} />
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

      {/* Diálogo de Detalle del Aspirante */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          pb: 3
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", width: 64, height: 64, fontSize: "1.5rem", border: "3px solid rgba(255, 255, 255, 0.3)" }}>
              {clienteDetail ? getInitials(clienteDetail.nombres, clienteDetail.apellidos) : ""}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {clienteDetail ? `${clienteDetail.nombres} ${clienteDetail.apellidos}` : "Cargando..."}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Información completa del aspirante
              </Typography>
            </Box>
            {clienteDetail && (
              <>
                <Chip 
                  label={clienteDetail.estado || "Nuevo"} 
                  sx={{ 
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontWeight: 600,
                    border: "1px solid rgba(255, 255, 255, 0.3)"
                  }}
                />
                <IconButton
                  onClick={() => clienteDetail && loadClienteDetail(clienteDetail.id_cliente)}
                  disabled={loadingDetail}
                  sx={{ 
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" }
                  }}
                  title="Actualizar información"
                >
                  <RefreshIcon />
                </IconButton>
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : clienteDetail ? (
            <Box sx={{ mt: 2 }}>
              {/* Información Personal */}
              <Card sx={{ 
                mb: 3, 
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <PersonIcon sx={{ color: "#667eea", fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                      Información Personal
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            Nombres
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.nombres}
                        </Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            Apellidos
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.apellidos}
                        </Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <BadgeIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            {clienteDetail.tipo_identificacion}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.numero_identificacion}
                        </Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <EmailIcon sx={{ color: "#10b981", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            Correo Electrónico
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.correo || "No registrado"}
                        </Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            Teléfono
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.telefono || "No registrado"}
                        </Typography>
                      </Card>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                      <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <PhoneIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                            Celular
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {clienteDetail.celular || "No registrado"}
                        </Typography>
                      </Card>
                    </Box>
                    {clienteDetail.fecha_nacimiento && (
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                        <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <CalendarTodayIcon sx={{ color: "#ec4899", fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                              Fecha de Nacimiento
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {new Date(clienteDetail.fecha_nacimiento).toLocaleDateString()}
                          </Typography>
                        </Card>
                      </Box>
                    )}
                    {clienteDetail.genero && (
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                        <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <PersonIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                              Género
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {clienteDetail.genero}
                          </Typography>
                        </Card>
                      </Box>
                    )}
                    {clienteDetail.nacionalidad && (
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                        <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <LocationOnIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                              Nacionalidad
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {clienteDetail.nacionalidad}
                          </Typography>
                        </Card>
                      </Box>
                    )}
                    {clienteDetail.origen && (
                      <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)" }, minWidth: 0 }}>
                        <Card sx={{ bgcolor: "white", p: 2, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <LocationOnIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                              Origen
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                            {clienteDetail.origen}
                          </Typography>
                        </Card>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Postulaciones */}
              <Card sx={{ 
                mb: 3, 
                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon sx={{ color: "#f97316", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Postulaciones ({postulaciones.length})
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const currentYear = new Date().getFullYear();
                        setPostulacionForm({
                          id_carrera: carreras[0]?.id_carrera || "",
                          periodo_academico: `${currentYear}-1`,
                          estado_postulacion: "Pendiente",
                          observaciones: "",
                        });
                        setOpenPostulacionDialog(true);
                      }}
                      sx={{
                        bgcolor: "#f97316",
                        "&:hover": { bgcolor: "#ea580c" },
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Crear Postulación
                    </Button>
                  </Box>
                  {postulaciones.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 700 }}>Carrera</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Período Académico</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Fecha de Postulación</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {postulaciones.map((post) => (
                            <TableRow key={post.id_postulacion} hover>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {post.carrera?.nombre_carrera || "No especificada"}
                              </TableCell>
                              <TableCell>{post.periodo_academico}</TableCell>
                              <TableCell>
                                {post.fecha_postulacion 
                                  ? new Date(post.fecha_postulacion).toLocaleDateString()
                                  : "No registrada"}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={post.estado_postulacion || "Pendiente"} 
                                  size="small" 
                                  color={post.estado_postulacion === "Aprobada" ? "success" : "default"}
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <SchoolIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay postulaciones registradas
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Documentos */}
              <Card sx={{ 
                mb: 3, 
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DescriptionIcon sx={{ color: "#667eea", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Documentos ({documentos.length})
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenUploadDialog(true)}
                      sx={{
                        bgcolor: "#667eea",
                        "&:hover": { bgcolor: "#5568d3" },
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Subir Documento
                    </Button>
                  </Box>
                  {documentos.length > 0 ? (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 700 }}>Tipo de Documento</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Nombre del Archivo</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {documentos.map((doc) => (
                            <TableRow key={doc.id_documento} hover>
                              <TableCell>{doc.tipo_documento}</TableCell>
                              <TableCell>
                                {doc.url_archivo ? (
                                  <Button
                                    size="small"
                                    href={doc.url_archivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<DescriptionIcon />}
                                    sx={{ textTransform: "none" }}
                                  >
                                    {doc.nombre_archivo}
                                  </Button>
                                ) : (
                                  doc.nombre_archivo || "Sin archivo"
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={doc.estado_documento || "Pendiente"} 
                                  size="small" 
                                  color={doc.estado_documento === "Aprobado" ? "success" : doc.estado_documento === "Rechazado" ? "error" : "warning"}
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>{doc.observaciones || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <DescriptionIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No hay documentos registrados
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Becas */}
              <Card sx={{ 
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Becas
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => {
                        setSelectedBecaId(becaAsignada?.id_beca || becaAsignada?.beca?.id_beca || "");
                        // Si hay beca asignada, prellenar el formulario
                        if (becaAsignada) {
                          setBecaForm({
                            periodo_academico: becaAsignada.periodo_academico || "",
                            monto_otorgado: becaAsignada.monto_otorgado || "",
                            estado: becaAsignada.estado || "Vigente",
                          });
                        } else {
                          // Si no hay beca, inicializar con valores por defecto
                          const currentYear = new Date().getFullYear();
                          setBecaForm({
                            periodo_academico: `${currentYear}-1`,
                            monto_otorgado: "",
                            estado: "Vigente",
                          });
                        }
                        setOpenBecaDialog(true);
                      }}
                      sx={{
                        bgcolor: "#10b981",
                        "&:hover": { bgcolor: "#059669" },
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      {becaAsignada ? "Cambiar Beca" : "Asignar Beca"}
                    </Button>
                  </Box>
                  {becaAsignada ? (
                    <Box sx={{ 
                      mb: 3,
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      border: "2px solid #10b981"
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 32 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                            Beca Asignada
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: "#059669" }}>
                            {becaAsignada.beca?.nombre_beca || "Beca asignada"}
                          </Typography>
                        </Box>
                        <Chip 
                          label={becaAsignada.estado || "Vigente"} 
                          color={becaAsignada.estado === "Vigente" ? "success" : "default"}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {becaAsignada.beca && (
                          <>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              <strong>Tipo:</strong> {becaAsignada.beca.tipo_beca}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              <strong>Cobertura:</strong> {becaAsignada.beca.porcentaje_cobertura}%
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              <strong>Período:</strong> {becaAsignada.periodo_academico}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              <strong>Monto:</strong> ${parseFloat(becaAsignada.monto_otorgado || "0").toLocaleString()}
                            </Typography>
                            {becaAsignada.beca.descripcion && (
                              <Typography variant="body2" sx={{ color: "#64748b" }}>
                                <strong>Descripción:</strong> {becaAsignada.beca.descripcion}
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 2, 
                      mb: 3,
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}>
                      <CancelIcon sx={{ color: "#ef4444", fontSize: 32 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        No hay beca asignada
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2, 
                    mb: 3,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                  }}>
                    {becas.length > 0 ? (
                      <>
                        <CheckCircleIcon sx={{ color: "#10b981", fontSize: 32 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          El aspirante puede aplicar a {becas.length} beca(s) disponible(s)
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CancelIcon sx={{ color: "#ef4444", fontSize: 32 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                          No hay becas disponibles en este momento
                        </Typography>
                      </>
                    )}
                  </Box>
                  {becas.length > 0 && (
                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ fontWeight: 700 }}>Nombre de la Beca</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>% Cobertura</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {becas.slice(0, 5).map((beca) => (
                            <TableRow key={beca.id_beca} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{beca.nombre_beca}</TableCell>
                              <TableCell>{beca.tipo_beca}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${beca.porcentaje_cobertura}%`} 
                                  size="small" 
                                  color="primary"
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={beca.estado || "Activa"} 
                                  size="small" 
                                  color={beca.estado === "Activa" ? "success" : "default"}
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Subir Documento */}
      <Dialog open={openUploadDialog} onClose={() => { setOpenUploadDialog(false); setSelectedFile(null); setUploadError(""); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UploadFileIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Subir Documento
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          <TextField
            fullWidth
            select
            label="Tipo de Documento"
            value={documentoForm.tipo_documento}
            onChange={(e) => setDocumentoForm({ ...documentoForm, tipo_documento: e.target.value })}
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Seleccione un tipo</option>
            <option value="Cédula">Cédula</option>
            <option value="Título de bachiller">Título de bachiller</option>
            <option value="Foto tamaño carnet">Foto tamaño carnet</option>
            <option value="Certificado de notas">Certificado de notas</option>
            <option value="Otro">Otro</option>
          </TextField>
          <Box sx={{ mb: 2 }}>
            <Input
              type="file"
              inputProps={{ accept: "application/pdf,image/jpeg,image/jpg,image/png" }}
              onChange={handleFileChange}
              sx={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{ 
                  py: 2,
                  borderStyle: "dashed",
                  borderWidth: 2,
                  textTransform: "none"
                }}
              >
                {selectedFile ? selectedFile.name : "Seleccionar archivo (PDF, JPG, PNG - Máx. 5MB)"}
              </Button>
            </label>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones (opcional)"
            value={documentoForm.observaciones}
            onChange={(e) => setDocumentoForm({ ...documentoForm, observaciones: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenUploadDialog(false); setSelectedFile(null); setUploadError(""); }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDocument}
            disabled={uploading || !selectedFile || !documentoForm.tipo_documento}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5568d3" } }}
          >
            {uploading ? "Subiendo..." : "Subir Documento"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Crear Postulación */}
      <Dialog open={openPostulacionDialog} onClose={() => setOpenPostulacionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          color: "white"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SchoolIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nueva Postulación
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Carrera</InputLabel>
            <Select 
              value={postulacionForm.id_carrera} 
              label="Carrera" 
              onChange={(e) => setPostulacionForm({ ...postulacionForm, id_carrera: e.target.value })}
            >
              {carreras.map((c) => (
                <MenuItem key={c.id_carrera} value={c.id_carrera}>
                  {c.nombre_carrera}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            margin="dense" 
            fullWidth 
            label="Período académico" 
            value={postulacionForm.periodo_academico} 
            onChange={(e) => setPostulacionForm({ ...postulacionForm, periodo_academico: e.target.value })} 
            placeholder="ej. 2025-1" 
            required 
            helperText="Formato: Año-Período (ej. 2025-1 para primer período de 2025)"
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
            rows={3}
            value={postulacionForm.observaciones} 
            onChange={(e) => setPostulacionForm({ ...postulacionForm, observaciones: e.target.value })} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPostulacionDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePostulacion}
            disabled={!postulacionForm.id_carrera || !postulacionForm.periodo_academico}
            sx={{ bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" } }}
          >
            Crear Postulación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Seleccionar Beca */}
      <Dialog open={openBecaDialog} onClose={() => setOpenBecaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {becaAsignada ? "Cambiar Beca Asignada" : "Seleccionar Beca para el Aspirante"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {becas.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay becas disponibles en este momento
            </Alert>
          ) : (
            <>
              <FormControl fullWidth margin="dense" required>
                <InputLabel>Seleccionar Beca</InputLabel>
                <Select 
                  value={selectedBecaId} 
                  label="Seleccionar Beca" 
                  onChange={(e) => setSelectedBecaId(e.target.value)}
                >
                  {becas.map((beca) => (
                    <MenuItem key={beca.id_beca} value={beca.id_beca}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {beca.nombre_beca}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {beca.tipo_beca} - {beca.porcentaje_cobertura}% cobertura
                          </Typography>
                        </Box>
                        <Chip 
                          label={beca.estado || "Activa"} 
                          size="small" 
                          color={beca.estado === "Activa" ? "success" : "default"}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField 
                margin="dense" 
                fullWidth 
                label="Período académico" 
                value={becaForm.periodo_academico} 
                onChange={(e) => setBecaForm({ ...becaForm, periodo_academico: e.target.value })} 
                placeholder="ej. 2025-1" 
                required 
                helperText="Formato: Año-Período (ej. 2025-1 para primer período de 2025)"
              />
              <TextField 
                margin="dense" 
                fullWidth 
                label="Monto otorgado" 
                type="number"
                value={becaForm.monto_otorgado} 
                onChange={(e) => setBecaForm({ ...becaForm, monto_otorgado: e.target.value })} 
                placeholder="0.00" 
                required 
                helperText="Ingresa el monto en dólares que se otorgará"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Estado</InputLabel>
                <Select 
                  value={becaForm.estado} 
                  label="Estado" 
                  onChange={(e) => setBecaForm({ ...becaForm, estado: e.target.value })}
                >
                  <MenuItem value="Vigente">Vigente</MenuItem>
                  <MenuItem value="Suspendida">Suspendida</MenuItem>
                  <MenuItem value="Finalizada">Finalizada</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          {selectedBecaId && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f0fdf4", borderRadius: 2 }}>
              {(() => {
                const becaSeleccionada = becas.find((b: any) => b.id_beca === selectedBecaId);
                if (!becaSeleccionada) return null;
                return (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      Detalles de la Beca Seleccionada:
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Nombre:</strong> {becaSeleccionada.nombre_beca}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Tipo:</strong> {becaSeleccionada.tipo_beca}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Cobertura:</strong> {becaSeleccionada.porcentaje_cobertura}%
                    </Typography>
                    {becaSeleccionada.descripcion && (
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Descripción:</strong> {becaSeleccionada.descripcion}
                      </Typography>
                    )}
                    {becaSeleccionada.monto_maximo && (
                      <Typography variant="body2">
                        <strong>Monto Máximo:</strong> ${becaSeleccionada.monto_maximo.toLocaleString()}
                      </Typography>
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBecaDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSelectBeca}
            disabled={!selectedBecaId || !becaForm.periodo_academico || !becaForm.monto_otorgado}
            sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
          >
            {becaAsignada ? "Actualizar Beca" : "Asignar Beca"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
