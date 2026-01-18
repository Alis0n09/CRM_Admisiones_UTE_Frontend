import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as seguimientoService from "../../services/seguimiento.service";
import * as clienteService from "../../services/cliente.service";
import type { Seguimiento } from "../../services/seguimiento.service";

const cols: Column<Seguimiento>[] = [
  { id: "cliente", label: "Cliente", minWidth: 160, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : "-" },
  { id: "fecha_contacto", label: "Fecha contacto", minWidth: 110 },
  { id: "medio", label: "Medio", minWidth: 100 },
  { id: "comentarios", label: "Comentarios", minWidth: 150 },
  { id: "proximo_paso", label: "Próximo paso", minWidth: 120 },
];

const empty = { id_cliente: "", fecha_contacto: "", medio: "Llamada", comentarios: "", proximo_paso: "", fecha_proximo_contacto: "" };

export default function AsesorSeguimientosPage() {
  const [items, setItems] = useState<Seguimiento[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Seguimiento | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    seguimientoService.getSeguimientos({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => { clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([])); }, []);

  const save = () => {
    if (!form.id_cliente) return;
    (sel ? seguimientoService.updateSeguimiento(sel.id_seguimiento, form) : seguimientoService.createSeguimiento(form))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Seguimientos" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm({ ...empty, id_cliente: clientes[0]?.id_cliente || "", fecha_contacto: new Date().toISOString().slice(0, 10) }); setOpen(true); }}
        onEdit={(r) => { setSel(r); setForm({ id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", fecha_contacto: r.fecha_contacto?.toString().slice(0, 10) || "", medio: r.medio || "", comentarios: r.comentarios || "", proximo_paso: r.proximo_paso || "", fecha_proximo_contacto: r.fecha_proximo_contacto?.toString().slice(0, 10) || "" }); setOpen(true); }}
        getId={(r) => r.id_seguimiento} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar seguimiento" : "Nuevo seguimiento"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Fecha contacto" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_contacto} onChange={(e) => setForm({ ...form, fecha_contacto: e.target.value })} />
          <TextField margin="dense" fullWidth select label="Medio" value={form.medio} onChange={(e) => setForm({ ...form, medio: e.target.value })}>
            <MenuItem value="Llamada">Llamada</MenuItem><MenuItem value="Email">Email</MenuItem><MenuItem value="WhatsApp">WhatsApp</MenuItem><MenuItem value="Presencial">Presencial</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Comentarios" multiline value={form.comentarios} onChange={(e) => setForm({ ...form, comentarios: e.target.value })} />
          <TextField margin="dense" fullWidth label="Próximo paso" value={form.proximo_paso} onChange={(e) => setForm({ ...form, proximo_paso: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha próximo contacto" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_proximo_contacto} onChange={(e) => setForm({ ...form, fecha_proximo_contacto: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
