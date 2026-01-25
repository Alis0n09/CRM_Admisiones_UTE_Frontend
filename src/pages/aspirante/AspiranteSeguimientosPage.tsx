import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import SeguimientoViewModal from "../../components/SeguimientoViewModal";
import * as seguimientoService from "../../services/seguimiento.service";
import type { Seguimiento } from "../../services/seguimiento.service";

const cols: Column<Seguimiento>[] = [
  { id: "fecha_contacto", label: "Fecha contacto", minWidth: 120 },
  { id: "medio", label: "Medio", minWidth: 100 },
  { id: "comentarios", label: "Comentarios", minWidth: 180 },
  { id: "proximo_paso", label: "Próximo paso", minWidth: 130 },
  { id: "fecha_proximo_contacto", label: "Próx. contacto", minWidth: 110 },
];

export default function AspiranteSeguimientosPage() {
  const [items, setItems] = useState<Seguimiento[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Seguimiento | null>(null);
  const [form, setForm] = useState<{ comentarios: string; proximo_paso: string }>({ comentarios: "", proximo_paso: "" });

  const load = useCallback(() => {
    seguimientoService.getSeguimientos({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  const save = () => {
    if (!sel) return;
    seguimientoService.updateSeguimiento(sel.id_seguimiento, form)
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Seguimientos" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onView={(r) => { setSel(r); setOpenView(true); }}
        onEdit={(r) => { setSel(r); setForm({ comentarios: r.comentarios || "", proximo_paso: r.proximo_paso || "" }); setOpen(true); }}
        getId={(r) => r.id_seguimiento} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar seguimiento</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Comentarios" multiline value={form.comentarios} onChange={(e) => setForm({ ...form, comentarios: e.target.value })} />
          <TextField margin="dense" fullWidth label="Próximo paso" value={form.proximo_paso} onChange={(e) => setForm({ ...form, proximo_paso: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <SeguimientoViewModal open={openView} onClose={() => setOpenView(false)} seguimiento={sel} />
    </>
  );
}
