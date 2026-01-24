import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as s from "../../services/beca.service";
import type { Beca } from "../../services/beca.service";

// Becas por defecto que se ofrecen
const becasPorDefecto: Partial<Beca>[] = [
  {
    nombre_beca: "Becas por mérito",
    tipo_beca: "Mérito",
    descripcion: "Reconocimiento al rendimiento académico",
    porcentaje_cobertura: 50,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    estado: "Activa",
  },
  {
    nombre_beca: "Apoyo socioeconómico",
    tipo_beca: "Socioeconómica",
    descripcion: "Opciones de ayuda según situación y requisitos",
    porcentaje_cobertura: 100,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    estado: "Activa",
  },
  {
    nombre_beca: "Convenios y descuentos",
    tipo_beca: "Convenio",
    descripcion: "Beneficios por convenios institucionales",
    porcentaje_cobertura: 30,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    estado: "Activa",
  },
  {
    nombre_beca: "Apoyo por deporte",
    tipo_beca: "Mérito",
    descripcion: "Beneficios para deportistas destacados",
    porcentaje_cobertura: 40,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    estado: "Activa",
  },
];

const cols: Column<Beca>[] = [
  { id: "nombre_beca", label: "Nombre", minWidth: 160 },
  { id: "tipo_beca", label: "Tipo", minWidth: 120 },
  { id: "porcentaje_cobertura", label: "% Cobertura", minWidth: 100 },
  { id: "fecha_inicio", label: "Inicio", minWidth: 100 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

const empty: Partial<Beca> = { nombre_beca: "", tipo_beca: "Mérito", descripcion: "", porcentaje_cobertura: 50, fecha_inicio: new Date().toISOString().slice(0, 10), estado: "Activa" };

export default function BecasPage() {
  const [items, setItems] = useState<Beca[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Beca | null>(null);
  const [form, setForm] = useState<Partial<Beca>>(empty);

  const load = useCallback(() => {
    s.getBecas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  const inicializarBecasPorDefecto = useCallback(async () => {
    try {
      for (const beca of becasPorDefecto) {
        try {
          await s.createBeca(beca as any);
        } catch (error: any) {
          // Si la beca ya existe, continuar con la siguiente
          if (error?.response?.status !== 400 && error?.response?.status !== 409) {
            console.error("Error al crear beca:", error);
          }
        }
      }
      // Recargar después de crear las becas
      s.getBecas({ page, limit }).then((r: any) => {
        setItems(r?.items ?? []);
        setTotal(r?.meta?.totalItems ?? 0);
      }).catch(() => setItems([]));
    } catch (error) {
      console.error("Error al crear las becas por defecto:", error);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
    // Inicializar automáticamente si no hay becas
    s.getBecas({ page: 1, limit: 1 }).then((r: any) => {
      if ((r?.items ?? []).length === 0) {
        // No hay becas, inicializar con las por defecto
        inicializarBecasPorDefecto();
      }
    }).catch(() => {});
  }, [load, inicializarBecasPorDefecto]);

  const save = () => {
    if (!form.nombre_beca || !form.tipo_beca || form.porcentaje_cobertura == null) return;
    (sel ? s.updateBeca(sel.id_beca, form) : s.createBeca(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Beca) => {
    if (!confirm("¿Eliminar esta beca?")) return;
    s.deleteBeca(row.id_beca).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const inicializarBecasPorDefectoManual = async () => {
    if (!confirm("¿Deseas crear las becas por defecto que se ofrecen? Esto creará las becas si no existen.")) return;
    
    try {
      for (const beca of becasPorDefecto) {
        try {
          await s.createBeca(beca as any);
        } catch (error: any) {
          // Si la beca ya existe, continuar con la siguiente
          if (error?.response?.status !== 400 && error?.response?.status !== 409) {
            console.error("Error al crear beca:", error);
          }
        }
      }
      load();
      alert("Becas por defecto creadas exitosamente");
    } catch (error) {
      alert("Error al crear las becas por defecto");
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Becas que ofrecemos
        </Typography>
        {items.length === 0 && (
          <Button variant="outlined" onClick={inicializarBecasPorDefectoManual}>
            Inicializar con becas por defecto
          </Button>
        )}
      </Box>

      <DataTable title="Becas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_beca} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar beca" : "Nueva beca"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombre" value={form.nombre_beca ?? ""} onChange={(e) => setForm({ ...form, nombre_beca: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo" value={form.tipo_beca ?? "Mérito"} onChange={(e) => setForm({ ...form, tipo_beca: e.target.value })}>
            <MenuItem value="Mérito">Mérito</MenuItem><MenuItem value="Socioeconómica">Socioeconómica</MenuItem><MenuItem value="Convenio">Convenio</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Descripción" multiline value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <TextField margin="dense" fullWidth type="number" label="% Cobertura" value={form.porcentaje_cobertura ?? 0} onChange={(e) => setForm({ ...form, porcentaje_cobertura: parseFloat(e.target.value) || 0 })} />
          <TextField margin="dense" fullWidth type="number" label="Monto máximo" value={form.monto_maximo ?? ""} onChange={(e) => setForm({ ...form, monto_maximo: e.target.value ? parseFloat(e.target.value) : undefined })} />
          <TextField margin="dense" fullWidth label="Fecha inicio" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_inicio?.toString().slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Fecha fin" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_fin?.toString().slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value || undefined })} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado ?? "Activa"} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Activa">Activa</MenuItem><MenuItem value="Inactiva">Inactiva</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
    </>
  );
}
