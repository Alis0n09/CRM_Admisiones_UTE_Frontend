import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as s from "../../services/cliente.service";
import type { Cliente } from "../../services/cliente.service";

const cols: Column<Cliente>[] = [
  { id: "nombres", label: "Nombres", minWidth: 120 },
  { id: "apellidos", label: "Apellidos", minWidth: 120 },
  { id: "numero_identificacion", label: "Cédula", minWidth: 100 },
  { id: "correo", label: "Correo", minWidth: 160 },
  { id: "celular", label: "Celular", minWidth: 100 },
  { id: "origen", label: "Origen", minWidth: 100 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

const empty: Partial<Cliente> = { nombres: "", apellidos: "", tipo_identificacion: "Cédula", numero_identificacion: "", origen: "Web", estado: "Nuevo" };

export default function ClientesPage() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>(empty);

  const load = useCallback(() => {
    s.getClientes({ page, limit, search: search || undefined }).then((r) => {
      const list = (r as any).items ?? (Array.isArray(r) ? r : []);
      setItems(list);
      setTotal((r as any).meta?.totalItems ?? list.length);
    }).catch(() => setItems([]));
  }, [page, limit, search]);

  useEffect(() => load(), [load]);

  const openAdd = () => { setSel(null); setForm(empty); setOpen(true); };
  const openEdit = (row: Cliente) => { setSel(row); setForm({ ...row }); setOpen(true); };

  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numero_identificacion || !form.origen) return;
    (sel ? s.updateCliente(sel.id_cliente, form) : s.createCliente(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Cliente) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    s.deleteCliente(row.id_cliente).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable
        title="Clientes (Aspirantes)"
        columns={cols}
        rows={items}
        total={total}
        page={page}
        rowsPerPage={limit}
        onPageChange={setPage}
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={del}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Buscar por nombre, cédula..."
        getId={(r) => r.id_cliente}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem>
            <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            <MenuItem value="RUC">RUC</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Teléfono" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField margin="dense" fullWidth label="Celular" value={form.celular ?? ""} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
          <TextField margin="dense" fullWidth label="Origen" value={form.origen ?? ""} onChange={(e) => setForm({ ...form, origen: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado ?? "Nuevo"} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Nuevo">Nuevo</MenuItem>
            <MenuItem value="En proceso">En proceso</MenuItem>
            <MenuItem value="Matriculado">Matriculado</MenuItem>
            <MenuItem value="Inactivo">Inactivo</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
