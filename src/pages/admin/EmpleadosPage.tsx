import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Avatar, Box, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import EmpleadoViewModal from "../../components/EmpleadoViewModal";
import * as s from "../../services/empleado.service";
import type { Empleado } from "../../services/empleado.service";

const cols: Column<Empleado>[] = [
  {
    id: "empleado",
    label: "EMPLEADO",
    minWidth: 250,
    format: (_, row: Empleado) => {
      const initials = `${row.nombres?.[0] || ""}${row.apellidos?.[0] || ""}`.toUpperCase();
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 40, height: 40, fontSize: "0.875rem", fontWeight: 600 }}>
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
  { id: "departamento", label: "DEPARTAMENTO", minWidth: 140 },
];

const empty: Partial<Empleado> = { nombres: "", apellidos: "", tipo_identificacion: "Cédula", numero_identificacion: "" };

export default function EmpleadosPage() {
  const [items, setItems] = useState<Empleado[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Empleado | null>(null);
  const [form, setForm] = useState<Partial<Empleado>>(empty);

  const load = useCallback(() => {
    s.getEmpleados({ page, limit }).then((r) => {
      const list = (r as any).items ?? [];
      setItems(list);
      setTotal((r as any).meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numero_identificacion) return;
    
    if (sel) {
      // Al actualizar, excluir id_empleado del body ya que va en la URL
      const { id_empleado, ...updateData } = form;
      s.updateEmpleado(sel.id_empleado, updateData)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    } else {
      s.createEmpleado(form as any)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    }
  };

  const del = (row: Empleado) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    s.deleteEmpleado(row.id_empleado).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const handleView = (row: Empleado) => { setSel(row); setOpenView(true); };

  return (
    <>
      <DataTable 
        title="Empleados (Asesores)" 
        columns={cols} 
        rows={items} 
        total={total} 
        page={page} 
        rowsPerPage={limit}
        onPageChange={setPage} 
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onView={handleView}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onDelete={del} 
        searchPlaceholder="Buscar empleados..."
        getId={(r) => r.id_empleado} 
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar empleado" : "Nuevo empleado"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Teléfono" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField margin="dense" fullWidth label="Departamento" value={form.departamento ?? ""} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <EmpleadoViewModal open={openView} onClose={() => setOpenView(false)} empleado={sel} />
    </>
  );
}
