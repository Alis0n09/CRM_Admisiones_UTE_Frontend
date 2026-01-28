import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Avatar, Box, Chip, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import TareaViewModal from "../../components/TareaViewModal";
import * as tareaService from "../../services/tarea.service";
import * as clienteService from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";
import * as carreraService from "../../services/carrera.service";
import type { TareaCrm } from "../../services/tarea.service";
import { useAuth } from "../../context/AuthContext";
import Assignment from "@mui/icons-material/Assignment";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Event from "@mui/icons-material/Event";

function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("proceso")) return "info";
  if (estadoLower.includes("completada")) return "success";
  return "default";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  } catch {
    return dateStr;
  }
}

const cols: Column<TareaCrm>[] = [
  { 
    id: "descripcion", 
    label: "Tarea", 
    minWidth: 250,
    format: (v, r) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#f59e0b", width: 40, height: 40, fontSize: "0.875rem" }}>
          <Assignment sx={{ fontSize: 20 }} />
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            {v || "Sin descripción"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {r.id_tarea?.slice(0, 8)}
          </Typography>
        </Box>
      </Box>
    )
  },
  { 
    id: "cliente", 
    label: "Cliente", 
    minWidth: 180,
    format: (_, r) => r.cliente ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "#8b5cf6", width: 36, height: 36, fontSize: "0.75rem" }}>
          {getInitials(r.cliente.nombres, r.cliente.apellidos)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {r.cliente.nombres} {r.cliente.apellidos}
          </Typography>
        </Box>
      </Box>
    ) : "-" 
  },
  { 
    id: "fecha_asignacion", 
    label: "Asignación", 
    minWidth: 130,
    format: (v) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarToday sx={{ color: "#3b82f6", fontSize: 18 }} />
        <Typography variant="body2">{formatDate(v)}</Typography>
      </Box>
    )
  },
  { 
    id: "fecha_vencimiento", 
    label: "Vencimiento", 
    minWidth: 140,
    format: (v) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Event sx={{ color: "#ef4444", fontSize: 18 }} />
        <Typography variant="body2" fontWeight={v ? 500 : 400}>
          {formatDate(v)}
        </Typography>
      </Box>
    )
  },
  { 
    id: "estado", 
    label: "Estado", 
    minWidth: 140,
    format: (v) => (
      <Chip 
        label={v || "Pendiente"} 
        size="small" 
        color={getEstadoColor(v) as any}
        sx={{ fontWeight: 600 }}
      />
    )
  },
];

export default function AsesorTareasPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<TareaCrm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<TareaCrm | null>(null);
  const [form, setForm] = useState<{ id_empleado: string; id_cliente: string; descripcion: string; fecha_asignacion: string; fecha_vencimiento: string; estado: string }>({ id_empleado: "", id_cliente: "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" });

  const load = useCallback(() => {
    tareaService.getTareas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => {
    clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
    carreraService.getCarreras({ limit: 200 }).then((r: any) => setCarreras(r?.items ?? [])).catch(() => setCarreras([]));
  }, []);

  useEffect(() => { if (user?.id_empleado) setForm((f) => ({ ...f, id_empleado: user.id_empleado! })); }, [user?.id_empleado]);

  const openAdd = () => { setSel(null); setForm({ id_empleado: user?.id_empleado || "", id_cliente: clientes[0]?.id_cliente || "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" }); setOpen(true); };
  const handleView = (r: TareaCrm) => { setSel(r); setOpenView(true); };
  const openEdit = (r: TareaCrm) => { setSel(r); setForm({ id_empleado: user?.id_empleado || (r.empleado as any)?.id_empleado || "", id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", descripcion: r.descripcion || "", fecha_asignacion: r.fecha_asignacion || "", fecha_vencimiento: r.fecha_vencimiento || "", estado: r.estado || "Pendiente" }); setOpen(true); };

  const save = async () => {
    if (!form.id_cliente || !form.descripcion) { alert("Completa cliente y descripción"); return; }
    const idEmpleado = String(form.id_empleado || user?.id_empleado || "");
    const idCliente = String(form.id_cliente || "");
    
    if (!idEmpleado || !idCliente) {
      alert("Error: faltan datos de empleado o cliente");
      return;
    }
    
    const payload = { 
      ...form, 
      id_empleado: idEmpleado,
      id_cliente: idCliente
    };
    
    const estadoAnterior = sel?.estado || "";
    const estadoNuevo = form.estado;
    const seCompleto = estadoNuevo === "Completada" && estadoAnterior !== "Completada";
    
    try {
      if (sel) {
        // Al actualizar, incluir id_empleado e id_cliente como strings
        const updatePayload = {
          id_empleado: idEmpleado,
          id_cliente: idCliente,
          descripcion: form.descripcion,
          fecha_asignacion: form.fecha_asignacion || undefined,
          fecha_vencimiento: form.fecha_vencimiento || undefined,
          estado: form.estado
        };
        await tareaService.updateTarea(sel.id_tarea, updatePayload);
        
        // Si se marcó como completada, crear postulación automáticamente
        if (seCompleto) {
          await crearPostulacionAutomatica(idCliente);
        }
        
        setOpen(false);
        load();
      } else {
        await tareaService.createTarea(payload as any);
        
        // Si se crea como completada, crear postulación automáticamente
        if (estadoNuevo === "Completada") {
          await crearPostulacionAutomatica(idCliente);
        }
        
        setOpen(false);
        load();
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  const crearPostulacionAutomatica = async (idCliente: string) => {
    try {
      console.log("🔄 Verificando si se debe crear postulación automática para cliente:", idCliente);
      
      // Verificar si ya existe una postulación para este cliente
      const postulacionesExistentes = await postulacionService.getPostulaciones({ id_cliente: idCliente });
      const listaPostulaciones = Array.isArray(postulacionesExistentes) 
        ? postulacionesExistentes 
        : (postulacionesExistentes as any)?.items || [];
      
      if (listaPostulaciones.length > 0) {
        console.log(`ℹ️ Ya existe ${listaPostulaciones.length} postulación(es) para este cliente, no se creará una nueva`);
        return;
      }

      // Obtener la primera carrera disponible
      if (carreras.length === 0) {
        console.warn("⚠️ No hay carreras disponibles para crear la postulación");
        alert("⚠️ No se pudo crear la postulación automáticamente: No hay carreras disponibles en el sistema.");
        return;
      }

      const primeraCarrera = carreras[0];
      const añoActual = new Date().getFullYear();
      const mesActual = new Date().getMonth() + 1; // 1-12
      const periodoAcademico = mesActual >= 1 && mesActual <= 6 ? `${añoActual}-1` : `${añoActual}-2`;

      console.log("📝 Creando postulación automática:", {
        id_cliente: idCliente,
        id_carrera: primeraCarrera.id_carrera,
        carrera: primeraCarrera.nombre_carrera,
        periodo_academico: periodoAcademico
      });

      const nuevaPostulacion = await postulacionService.createPostulacion({
        id_cliente: idCliente,
        id_carrera: primeraCarrera.id_carrera,
        periodo_academico: periodoAcademico,
        estado_postulacion: "Pendiente",
        observaciones: "Postulación creada automáticamente al completar la tarea"
      });

      console.log(`✅ Postulación creada automáticamente para el cliente ${idCliente}:`, nuevaPostulacion);
      
      // Mostrar mensaje de éxito al usuario
      alert(`✅ Tarea completada exitosamente.\n\n📋 Se ha creado automáticamente una postulación para este cliente:\n- Carrera: ${primeraCarrera.nombre_carrera}\n- Período: ${periodoAcademico}\n- Estado: Pendiente`);
    } catch (error: any) {
      console.error("❌ Error al crear postulación automática:", error?.response?.data || error);
      const errorMsg = error?.response?.data?.message || error?.message || "Error desconocido";
      alert(`⚠️ La tarea se completó, pero no se pudo crear la postulación automáticamente.\n\nError: ${errorMsg}\n\nPuedes crear la postulación manualmente desde la sección de Postulaciones.`);
    }
  };

  return (
    <>
      <DataTable title="Mis tareas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onView={handleView} onEdit={openEdit} getId={(r) => r.id_tarea} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required disabled={!!sel}>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Descripción" multiline value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Fecha asignación" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_asignacion} onChange={(e) => setForm({ ...form, fecha_asignacion: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha vencimiento" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem><MenuItem value="En proceso">En proceso</MenuItem><MenuItem value="Completada">Completada</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <TareaViewModal open={openView} onClose={() => setOpenView(false)} tarea={sel} />
    </>
  );
}
