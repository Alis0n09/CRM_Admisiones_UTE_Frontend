import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import RolViewModal from "../../components/RolViewModal";
import * as s from "../../services/rol.service";
import type { Rol } from "../../services/rol.service";

const cols: Column<Rol>[] = [
  { id: "nombre", label: "Nombre", minWidth: 180 },
];

export default function RolesPage() {
  const [items, setItems] = useState<Rol[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Rol | null>(null);
  const [form, setForm] = useState<{ nombre: string }>({ nombre: "" });

  const load = useCallback(() => {
    s.getRoles().then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
  }, []);

  useEffect(() => load(), [load]);

  const save = () => {
    if (!form.nombre) return;
    (sel ? s.updateRol(sel.id_rol, form) : s.createRol(form))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Rol) => {
    if (!confirm("¿Eliminar este rol?")) return;
    s.deleteRol(row.id_rol).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const handleView = (row: Rol) => {
    setSel(row);
    setOpenView(true);
  };

  return (
    <>
      <DataTable title="Roles" columns={cols} rows={items} total={items.length} page={1} rowsPerPage={Math.max(10, items.length)}
        onPageChange={() => {}} onRowsPerPageChange={() => {}}
        onAdd={() => { setSel(null); setForm({ nombre: "" }); setOpen(true); }}
        onView={handleView}
        onEdit={(r) => { setSel(r); setForm({ nombre: r.nombre }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_rol} />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{sel ? "Editar rol" : "Nuevo rol"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombre" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} placeholder="ADMIN, ASESOR, ASPIRANTE" required />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <RolViewModal open={openView} onClose={() => setOpenView(false)} rol={sel} />
    </>
  );
}
