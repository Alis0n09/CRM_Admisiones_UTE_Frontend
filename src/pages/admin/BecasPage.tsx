import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import BecaViewModal from "../../components/BecaViewModal";
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
    tipo_beca: "Deporte",
    descripcion: "Beneficios para deportistas destacados",
    porcentaje_cobertura: 40,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    estado: "Activa",
  },
  {
    nombre_beca: "Beca STEAM para mujeres",
    tipo_beca: "STEAM",
    descripcion: "Apoyo para mujeres en ciencia, tecnología e ingeniería",
    porcentaje_cobertura: 50,
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
  const [openView, setOpenView] = useState(false);
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
    
    // Convertir porcentaje_cobertura a número decimal válido
    let porcentajeCobertura: number;
    if (typeof form.porcentaje_cobertura === 'number' && !isNaN(form.porcentaje_cobertura)) {
      porcentajeCobertura = form.porcentaje_cobertura;
    } else {
      const parsed = Number(String(form.porcentaje_cobertura).replace(',', '.'));
      porcentajeCobertura = isNaN(parsed) ? 0 : parsed;
    }
    
    // Convertir monto_maximo a número decimal válido si existe
    let montoMaximo: number | undefined;
    if (form.monto_maximo != null && form.monto_maximo !== "" && form.monto_maximo !== 0) {
      if (typeof form.monto_maximo === 'number' && !isNaN(form.monto_maximo)) {
        montoMaximo = form.monto_maximo;
      } else {
        const parsed = Number(String(form.monto_maximo).replace(',', '.'));
        montoMaximo = isNaN(parsed) ? undefined : parsed;
      }
    }
    
    // Validar que los números sean válidos antes de enviar
    if (isNaN(porcentajeCobertura)) {
      alert("El porcentaje de cobertura debe ser un número válido");
      return;
    }
    
    if (montoMaximo != null && isNaN(montoMaximo)) {
      alert("El monto máximo debe ser un número válido");
      return;
    }
    
    // Preparar los datos asegurando que los números sean decimales válidos
    // El backend puede estar esperando números como strings con formato decimal explícito
    // Intentamos primero como números, pero si falla, el backend podría necesitar strings
    const dataToSend: any = {
      nombre_beca: form.nombre_beca,
      tipo_beca: form.tipo_beca,
      descripcion: form.descripcion || undefined,
      porcentaje_cobertura: porcentajeCobertura, // Enviar como número
      fecha_inicio: form.fecha_inicio,
      fecha_fin: form.fecha_fin || undefined,
      estado: form.estado || "Activa",
    };
    
    // Solo incluir monto_maximo si tiene un valor válido
    if (montoMaximo != null && montoMaximo > 0) {
      dataToSend.monto_maximo = montoMaximo; // Enviar como número
    }
    
    // Asegurar que los números sean válidos
    if (isNaN(porcentajeCobertura) || !isFinite(porcentajeCobertura)) {
      alert("El porcentaje de cobertura debe ser un número válido");
      return;
    }
    
    if (montoMaximo != null && (isNaN(montoMaximo) || !isFinite(montoMaximo))) {
      alert("El monto máximo debe ser un número válido");
      return;
    }
    
    // Convertir a strings con formato decimal si el backend lo requiere
    // Esto es un workaround para backends que validan formato decimal estricto
    const payloadToSend: any = {
      ...dataToSend,
      porcentaje_cobertura: String(porcentajeCobertura.toFixed(2)),
    };
    
    if (montoMaximo != null && montoMaximo > 0) {
      payloadToSend.monto_maximo = String(montoMaximo.toFixed(2));
    }
    
    // Debug: verificar que los valores sean números válidos
    console.log("Datos a enviar (payload):", payloadToSend);
    console.log("Tipo de porcentaje_cobertura:", typeof payloadToSend.porcentaje_cobertura, payloadToSend.porcentaje_cobertura);
    console.log("Tipo de monto_maximo:", typeof payloadToSend.monto_maximo, payloadToSend.monto_maximo);
    
    (sel ? s.updateBeca(sel.id_beca, payloadToSend) : s.createBeca(payloadToSend))
      .then(() => { setOpen(false); load(); })
      .catch((e) => {
        console.error("Error al guardar beca:", e);
        alert(e?.response?.data?.message || e?.message || "Error al guardar la beca");
      });
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
        onView={(r) => { setSel(r); setOpenView(true); }}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_beca} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar beca" : "Nueva beca"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombre" value={form.nombre_beca ?? ""} onChange={(e) => setForm({ ...form, nombre_beca: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo" value={form.tipo_beca ?? "Mérito"} onChange={(e) => setForm({ ...form, tipo_beca: e.target.value })}>
            <MenuItem value="Mérito">Mérito</MenuItem>
            <MenuItem value="Socioeconómica">Socioeconómica</MenuItem>
            <MenuItem value="Convenio">Convenio</MenuItem>
            <MenuItem value="Deporte">Deporte</MenuItem>
            <MenuItem value="STEAM">STEAM para mujeres</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Descripción" multiline value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <TextField margin="dense" fullWidth type="number" label="% Cobertura" value={form.porcentaje_cobertura ?? 0} onChange={(e) => {
            const value = e.target.value;
            const numValue = value === "" ? 0 : Number(value);
            setForm({ ...form, porcentaje_cobertura: isNaN(numValue) ? 0 : numValue });
          }} />
          <TextField margin="dense" fullWidth type="number" label="Monto máximo" value={form.monto_maximo ?? ""} onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              setForm({ ...form, monto_maximo: undefined });
            } else {
              const numValue = Number(value);
              setForm({ ...form, monto_maximo: isNaN(numValue) ? undefined : numValue });
            }
          }} />
          <TextField margin="dense" fullWidth label="Fecha inicio" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_inicio?.toString().slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Fecha fin" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_fin?.toString().slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value || undefined })} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado ?? "Activa"} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Activa">Activa</MenuItem><MenuItem value="Inactiva">Inactiva</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <BecaViewModal open={openView} onClose={() => setOpenView(false)} beca={sel} />
    </>
  );
}
