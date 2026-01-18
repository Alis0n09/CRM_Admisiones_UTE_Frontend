import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as postulacionService from "../../services/postulacion.service";
import * as clienteService from "../../services/cliente.service";
import * as carreraService from "../../services/carrera.service";
import type { Postulacion } from "../../services/postulacion.service";

const cols: Column<Postulacion>[] = [
  { id: "cliente", label: "Cliente", minWidth: 160, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : "-" },
  { id: "carrera", label: "Carrera", minWidth: 180, format: (_, r) => r.carrera?.nombre_carrera ?? "-" },
  { id: "periodo_academico", label: "Período", minWidth: 100 },
  { id: "fecha_postulacion", label: "Fecha", minWidth: 100 },
  { id: "estado_postulacion", label: "Estado", minWidth: 100 },
];

export default function PostulacionesPage() {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Postulacion | null>(null);
  const [form, setForm] = useState<{ id_cliente: string; id_carrera: string; periodo_academico: string; estado_postulacion: string; observaciones: string }>({ id_cliente: "", id_carrera: "", periodo_academico: "", estado_postulacion: "Pendiente", observaciones: "" });

  const load = useCallback(() => {
    postulacionService.getPostulaciones({ page, limit }).then((r: any) => {
      const list = r?.items ?? (Array.isArray(r) ? r : []);
      setItems(list);
      setTotal(r?.meta?.totalItems ?? list.length);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => {
    clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
    carreraService.getCarreras({ limit: 200 }).then((r: any) => setCarreras(r?.items ?? [])).catch(() => setCarreras([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_cliente: clientes[0]?.id_cliente || "", id_carrera: carreras[0]?.id_carrera || "", periodo_academico: new Date().getFullYear() + "-1", estado_postulacion: "Pendiente", observaciones: "" }); setOpen(true); };
  const openEdit = (r: Postulacion) => { setSel(r); setForm({ id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", id_carrera: (r.carrera as any)?.id_carrera || r.id_carrera || "", periodo_academico: (r as any).periodo_academico || "", estado_postulacion: r.estado_postulacion || "Pendiente", observaciones: r.observaciones || "" }); setOpen(true); };

  const save = () => {
    if (!form.id_cliente || !form.id_carrera || !form.periodo_academico) { alert("Completa cliente, carrera y período"); return; }
    (sel ? postulacionService.updatePostulacion(sel.id_postulacion, form) : postulacionService.createPostulacion(form))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Postulacion) => {
    if (!confirm("¿Eliminar esta postulación?")) return;
    postulacionService.deletePostulacion(row.id_postulacion).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Postulaciones" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onEdit={openEdit} onDelete={del} getId={(r) => r.id_postulacion} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar postulación" : "Nueva postulación"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Carrera</InputLabel>
            <Select value={form.id_carrera} label="Carrera" onChange={(e) => setForm({ ...form, id_carrera: e.target.value })} required>
              {carreras.map((c) => <MenuItem key={c.id_carrera} value={c.id_carrera}>{c.nombre_carrera}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Período académico" value={form.periodo_academico} onChange={(e) => setForm({ ...form, periodo_academico: e.target.value })} placeholder="ej. 2025-1" required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado_postulacion} onChange={(e) => setForm({ ...form, estado_postulacion: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem><MenuItem value="En revisión">En revisión</MenuItem><MenuItem value="Aprobada">Aprobada</MenuItem><MenuItem value="Rechazada">Rechazada</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Observaciones" multiline value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
