import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as s from "../../services/carrera.service";
import type { Carrera } from "../../services/carrera.service";

const cols: Column<Carrera>[] = [
  { id: "nombre_carrera", label: "Carrera", minWidth: 200 },
  { id: "facultad", label: "Facultad", minWidth: 120 },
  { id: "duracion_semestres", label: "Semestres", minWidth: 90 },
  { id: "nivel_grado", label: "Nivel", minWidth: 90 },
  { id: "cupos_disponibles", label: "Cupos", minWidth: 70 },
  { id: "estado", label: "Estado", minWidth: 80 },
];

const empty: Partial<Carrera> = { nombre_carrera: "", facultad: "", duracion_semestres: 8, nivel_grado: "Tecnología", cupos_disponibles: 50, estado: "1" };

export default function CarrerasPage() {
  const [items, setItems] = useState<Carrera[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Carrera | null>(null);
  const [form, setForm] = useState<Partial<Carrera>>(empty);

  const load = useCallback(() => {
    s.getCarreras({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  const save = () => {
    if (!form.nombre_carrera || !form.facultad) return;
    (sel ? s.updateCarrera(sel.id_carrera, form) : s.createCarrera(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Carrera) => {
    if (!confirm("¿Eliminar esta carrera?")) return;
    s.deleteCarrera(row.id_carrera).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Carreras" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_carrera} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar carrera" : "Nueva carrera"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombre" value={form.nombre_carrera ?? ""} onChange={(e) => setForm({ ...form, nombre_carrera: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Facultad" value={form.facultad ?? ""} onChange={(e) => setForm({ ...form, facultad: e.target.value })} required />
          <TextField margin="dense" fullWidth type="number" label="Duración (semestres)" value={form.duracion_semestres ?? 8} onChange={(e) => setForm({ ...form, duracion_semestres: parseInt(e.target.value) || 0 })} />
          <TextField margin="dense" fullWidth select label="Nivel" value={form.nivel_grado ?? "Tecnología"} onChange={(e) => setForm({ ...form, nivel_grado: e.target.value })}>
            <MenuItem value="Tecnología">Tecnología</MenuItem><MenuItem value="Pregrado">Pregrado</MenuItem><MenuItem value="Posgrado">Posgrado</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth type="number" label="Cupos disponibles" value={form.cupos_disponibles ?? 50} onChange={(e) => setForm({ ...form, cupos_disponibles: parseInt(e.target.value) || 0 })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
