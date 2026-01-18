import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as tareaService from "../../services/tarea.service";
import * as empleadoService from "../../services/empleado.service";
import * as clienteService from "../../services/cliente.service";
import type { TareaCrm } from "../../services/tarea.service";

const cols: Column<TareaCrm>[] = [
  { id: "descripcion", label: "Descripción", minWidth: 180 },
  { id: "empleado", label: "Asesor", minWidth: 140, format: (_, r) => r.empleado ? `${r.empleado.nombres} ${r.empleado.apellidos}` : "-" },
  { id: "cliente", label: "Cliente", minWidth: 140, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : "-" },
  { id: "fecha_asignacion", label: "Asignación", minWidth: 100 },
  { id: "fecha_vencimiento", label: "Vencimiento", minWidth: 100 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

export default function TareasPage() {
  const [items, setItems] = useState<TareaCrm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [empleados, setEmpleados] = useState<{ id_empleado: string; nombres: string; apellidos: string }[]>([]);
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
    empleadoService.getEmpleados({ limit: 200 }).then((r: any) => setEmpleados(r?.items ?? [])).catch(() => setEmpleados([]));
    clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_empleado: empleados[0]?.id_empleado || "", id_cliente: clientes[0]?.id_cliente || "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" }); setOpen(true); };
  const openEdit = (r: TareaCrm) => { setSel(r); setForm({ id_empleado: (r.empleado as any)?.id_empleado || r.id_empleado || "", id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", descripcion: r.descripcion || "", fecha_asignacion: r.fecha_asignacion || "", fecha_vencimiento: r.fecha_vencimiento || "", estado: r.estado || "Pendiente" }); setOpen(true); };

  const save = () => {
    if (!form.id_empleado || !form.id_cliente || !form.descripcion) { alert("Completa empleado, cliente y descripción"); return; }
    (sel ? tareaService.updateTarea(sel.id_tarea, form) : tareaService.createTarea(form))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: TareaCrm) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    tareaService.deleteTarea(row.id_tarea).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Tareas CRM" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onEdit={openEdit} onDelete={del} getId={(r) => r.id_tarea} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Asesor (empleado)</InputLabel>
            <Select value={form.id_empleado} label="Asesor (empleado)" onChange={(e) => setForm({ ...form, id_empleado: e.target.value })} required>
              {empleados.map((e) => <MenuItem key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Descripción" multiline value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Fecha asignación" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_asignacion} onChange={(e) => setForm({ ...form, fecha_asignacion: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha vencimiento" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem><MenuItem value="En proceso">En proceso</MenuItem><MenuItem value="Completada">Completada</MenuItem><MenuItem value="Cancelada">Cancelada</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
