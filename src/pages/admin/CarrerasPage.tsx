import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import CarreraViewModal from "../../components/CarreraViewModal";
import * as s from "../../services/carrera.service";
import type { Carrera } from "../../services/carrera.service";

// Carreras por defecto que se ofrecen
const carrerasPorDefecto: Partial<Carrera>[] = [
  {
    nombre_carrera: "Tecnología en Desarrollo de Software",
    facultad: "Facultad de Tecnologías de la Información",
    duracion_semestres: 6,
    nivel_grado: "Tecnología Superior",
    cupos_disponibles: 50,
    estado: "1",
  },
  {
    nombre_carrera: "Tecnología en Administración de Empresas",
    facultad: "Facultad de Ciencias Administrativas",
    duracion_semestres: 6,
    nivel_grado: "Tecnología Superior",
    cupos_disponibles: 50,
    estado: "1",
  },
  {
    nombre_carrera: "Tecnología en Atención de Enfermería",
    facultad: "Facultad de Ciencias de la Salud",
    duracion_semestres: 6,
    nivel_grado: "Tecnología Superior",
    cupos_disponibles: 50,
    estado: "1",
  },
  {
    nombre_carrera: "Tecnología en Marketing Digital",
    facultad: "Facultad de Ciencias Administrativas",
    duracion_semestres: 6,
    nivel_grado: "Tecnología Superior",
    cupos_disponibles: 50,
    estado: "1",
  },
  {
    nombre_carrera: "Tecnología en Asistente de Odontología",
    facultad: "Facultad de Ciencias de la Salud",
    duracion_semestres: 6,
    nivel_grado: "Tecnología Superior",
    cupos_disponibles: 50,
    estado: "1",
  },
];

const cols: Column<Carrera>[] = [
  { id: "nombre_carrera", label: "Carrera", minWidth: 200 },
  { id: "facultad", label: "Facultad", minWidth: 120 },
  { id: "duracion_semestres", label: "Semestres", minWidth: 90 },
  { id: "nivel_grado", label: "Nivel", minWidth: 90 },
  { id: "cupos_disponibles", label: "Cupos", minWidth: 70 },
  { id: "estado", label: "Estado", minWidth: 80 },
];

const empty: Partial<Carrera> = { nombre_carrera: "", facultad: "", duracion_semestres: 6, nivel_grado: "Tecnología", cupos_disponibles: 50, estado: "1" };

export default function CarrerasPage() {
  const [items, setItems] = useState<Carrera[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Carrera | null>(null);
  const [form, setForm] = useState<Partial<Carrera>>(empty);

  const load = useCallback(() => {
    s.getCarreras({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  const inicializarCarrerasPorDefecto = useCallback(async () => {
    try {
      for (const carrera of carrerasPorDefecto) {
        try {
          await s.createCarrera(carrera as any);
        } catch (error: any) {
          // Si la carrera ya existe, continuar con la siguiente
          if (error?.response?.status !== 400 && error?.response?.status !== 409) {
            console.error("Error al crear carrera:", error);
          }
        }
      }
      // Recargar después de crear las carreras
      s.getCarreras({ page, limit }).then((r: any) => {
        setItems(r?.items ?? []);
        setTotal(r?.meta?.totalItems ?? 0);
      }).catch(() => setItems([]));
    } catch (error) {
      console.error("Error al crear las carreras por defecto:", error);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
    // Inicializar automáticamente si no hay carreras
    s.getCarreras({ page: 1, limit: 1 }).then((r: any) => {
      if ((r?.items ?? []).length === 0) {
        // No hay carreras, inicializar con las por defecto
        inicializarCarrerasPorDefecto();
      }
    }).catch(() => {});
  }, [load, inicializarCarrerasPorDefecto]);

  const save = () => {
    if (!form.nombre_carrera || !form.facultad) return;
    if (sel) {
      // Para actualizar, solo enviar los campos que pueden modificarse (excluir id_carrera)
      const { id_carrera, ...updateData } = form;
      s.updateCarrera(sel.id_carrera, updateData)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    } else {
      // Para crear, enviar todos los campos necesarios
      s.createCarrera(form as any)
        .then(() => { setOpen(false); load(); })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    }
  };

  const del = (row: Carrera) => {
    if (!confirm("¿Eliminar esta carrera?")) return;
    s.deleteCarrera(row.id_carrera).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const inicializarCarrerasPorDefectoManual = async () => {
    if (!confirm("¿Deseas crear las carreras por defecto que se ofrecen? Esto creará las carreras si no existen.")) return;

    try {
      for (const carrera of carrerasPorDefecto) {
        try {
          await s.createCarrera(carrera as any);
        } catch (error: any) {
          if (error?.response?.status !== 400 && error?.response?.status !== 409) {
            console.error("Error al crear carrera:", error);
          }
        }
      }
      load();
      alert("Carreras por defecto creadas exitosamente");
    } catch (error) {
      alert("Error al crear las carreras por defecto");
    }
  };

  const corregirDuraciones = async () => {
    if (!confirm("¿Actualizar todas las carreras con 4 semestres a 6 semestres? (Estándar para Tecnología Superior)")) return;
    try {
      const r = await s.getCarreras({ page: 1, limit: 500 });
      const items: Carrera[] = r?.items ?? [];
      const con4 = items.filter((c) => c.duracion_semestres === 4);
      for (const c of con4) {
        const { id_carrera, ...rest } = c;
        await s.updateCarrera(id_carrera, { ...rest, duracion_semestres: 6 });
      }
      load();
      alert(con4.length ? `Se actualizaron ${con4.length} carrera(s) a 6 semestres.` : "No hay carreras con 4 semestres.");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al corregir duraciones");
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Carreras que ofrecemos
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {items.length > 0 && (
            <Button variant="outlined" color="warning" onClick={corregirDuraciones}>
              Corregir duraciones (4 → 6 semestres)
            </Button>
          )}
          {items.length === 0 && (
            <Button variant="outlined" onClick={inicializarCarrerasPorDefectoManual}>
              Inicializar con carreras por defecto
            </Button>
          )}
        </Box>
      </Box>

      <DataTable title="Carreras" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onView={(r) => { setSel(r); setOpenView(true); }}
        onEdit={(r) => { setSel(r); setForm({ ...r, nivel_grado: "Tecnología", duracion_semestres: r.duracion_semestres === 4 ? 6 : r.duracion_semestres }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_carrera} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar carrera" : "Nueva carrera"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombre" value={form.nombre_carrera ?? ""} onChange={(e) => setForm({ ...form, nombre_carrera: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Facultad" value={form.facultad ?? ""} onChange={(e) => setForm({ ...form, facultad: e.target.value })} required />
          <TextField margin="dense" fullWidth type="number" label="Duración (semestres)" inputProps={{ min: 6 }} value={form.duracion_semestres ?? 6} onChange={(e) => setForm({ ...form, duracion_semestres: Math.max(6, parseInt(e.target.value, 10) || 6) })} />
          <TextField margin="dense" fullWidth select label="Nivel" value={form.nivel_grado ?? "Tecnología"} onChange={(e) => setForm({ ...form, nivel_grado: e.target.value })}>
            <MenuItem value="Tecnología">Tecnología</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth type="number" label="Cupos disponibles" value={form.cupos_disponibles ?? 50} onChange={(e) => setForm({ ...form, cupos_disponibles: parseInt(e.target.value) || 0 })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <CarreraViewModal open={openView} onClose={() => setOpenView(false)} carrera={sel} />
    </>
  );
}
