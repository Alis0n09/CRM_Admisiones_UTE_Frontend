import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import MatriculaViewModal from "../../components/MatriculaViewModal";
import * as matriculaService from "../../services/matricula.service";
import * as clienteService from "../../services/cliente.service";
import * as carreraService from "../../services/carrera.service";
import type { Matricula } from "../../services/matricula.service";

const cols: Column<Matricula>[] = [
  { id: "cliente", label: "Cliente", minWidth: 160, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : "-" },
  { id: "carrera", label: "Carrera", minWidth: 180, format: (_, r) => r.carrera?.nombre_carrera ?? "-" },
  { id: "periodo_academico", label: "Período", minWidth: 100 },
  { id: "fecha_matricula", label: "Fecha", minWidth: 100 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

export default function MatriculasPage() {
  const [items, setItems] = useState<Matricula[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Matricula | null>(null);
  const [form, setForm] = useState<{ id_cliente: string; id_carrera: string; periodo_academico: string; estado: string }>({ id_cliente: "", id_carrera: "", periodo_academico: "", estado: "Activa" });

  const load = useCallback(() => {
    matriculaService.getMatriculas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => {
    clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
    carreraService.getCarreras({ limit: 200 }).then((r: any) => setCarreras(r?.items ?? [])).catch(() => setCarreras([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_cliente: clientes[0]?.id_cliente || "", id_carrera: carreras[0]?.id_carrera || "", periodo_academico: new Date().getFullYear() + "-1", estado: "Activa" }); setOpen(true); };
  const handleView = (r: Matricula) => { setSel(r); setOpenView(true); };
  const openEdit = (r: Matricula) => { setSel(r); setForm({ id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", id_carrera: (r.carrera as any)?.id_carrera || r.id_carrera || "", periodo_academico: (r as any).periodo_academico || "", estado: r.estado || "Activa" }); setOpen(true); };

  const save = () => {
    if (!form.id_cliente || !form.id_carrera || !form.periodo_academico) { alert("Completa cliente, carrera y período"); return; }
    
    if (sel) {
      // Para actualizar: incluir todos los campos incluyendo estado
      matriculaService.updateMatricula(sel.id_matricula, form)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    } else {
      // Para crear: excluir el campo estado si el backend no lo acepta en la creación
      const { estado, ...formSinEstado } = form;
      matriculaService.createMatricula(formSinEstado as any)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    }
  };

  const del = (row: Matricula) => {
    if (!confirm("¿Eliminar esta matrícula?")) return;
    matriculaService.deleteMatricula(row.id_matricula).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Matrículas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onView={handleView} onEdit={openEdit} onDelete={del} getId={(r) => r.id_matricula} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar matrícula" : "Nueva matrícula"}</DialogTitle>
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
          <TextField margin="dense" fullWidth label="Período académico" value={form.periodo_academico} onChange={(e) => setForm({ ...form, periodo_academico: e.target.value })} placeholder="2025-1" required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Activa">Activa</MenuItem><MenuItem value="Inactiva">Inactiva</MenuItem><MenuItem value="Suspendida">Suspendida</MenuItem><MenuItem value="Egresado">Egresado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <MatriculaViewModal open={openView} onClose={() => setOpenView(false)} matricula={sel} />
    </>
  );
}
