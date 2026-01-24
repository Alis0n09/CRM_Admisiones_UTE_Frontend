import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Avatar, Box, Chip, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as tareaService from "../../services/tarea.service";
import * as clienteService from "../../services/cliente.service";
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
  const [open, setOpen] = useState(false);
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
  }, []);

  useEffect(() => { if (user?.id_empleado) setForm((f) => ({ ...f, id_empleado: user.id_empleado! })); }, [user?.id_empleado]);

  const openAdd = () => { setSel(null); setForm({ id_empleado: user?.id_empleado || "", id_cliente: clientes[0]?.id_cliente || "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" }); setOpen(true); };
  const openEdit = (r: TareaCrm) => { setSel(r); setForm({ id_empleado: user?.id_empleado || (r.empleado as any)?.id_empleado || "", id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", descripcion: r.descripcion || "", fecha_asignacion: r.fecha_asignacion || "", fecha_vencimiento: r.fecha_vencimiento || "", estado: r.estado || "Pendiente" }); setOpen(true); };

  const save = () => {
    if (!form.id_cliente || !form.descripcion) { alert("Completa cliente y descripción"); return; }
    const payload = { ...form, id_empleado: form.id_empleado || user?.id_empleado };
    (sel ? tareaService.updateTarea(sel.id_tarea, { descripcion: form.descripcion, fecha_asignacion: form.fecha_asignacion || undefined, fecha_vencimiento: form.fecha_vencimiento || undefined, estado: form.estado }) : tareaService.createTarea(payload as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Mis tareas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onEdit={openEdit} getId={(r) => r.id_tarea} />
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
    </>
  );
}
