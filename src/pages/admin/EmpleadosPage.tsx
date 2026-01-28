import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Avatar, Box, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import EmpleadoViewModal from "../../components/EmpleadoViewModal";
import * as s from "../../services/empleado.service";
import type { Empleado } from "../../services/empleado.service";

const cols: Column<Empleado>[] = [
  {
    id: "empleado",
    label: "EMPLEADO",
    minWidth: 250,
    format: (_, row: Empleado) => {
      const initials = `${row.nombres?.[0] || ""}${row.apellidos?.[0] || ""}`.toUpperCase();
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 40, height: 40, fontSize: "0.875rem", fontWeight: 600 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b" }}>
              {`${row.nombres || ""} ${row.apellidos || ""}`.trim()}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
              {row.correo || "-"}
            </Typography>
          </Box>
        </Stack>
      );
    },
  },
  { id: "numero_identificacion", label: "CÉDULA", minWidth: 120 },
  { id: "departamento", label: "DEPARTAMENTO", minWidth: 140 },
];

const empty: Partial<Empleado> = { nombres: "", apellidos: "", tipo_identificacion: "Cédula", numero_identificacion: "" };

export default function EmpleadosPage() {
  const [items, setItems] = useState<Empleado[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Empleado | null>(null);
  const [form, setForm] = useState<Partial<Empleado>>(empty);

  const load = useCallback(() => {
    s.getEmpleados({ page, limit }).then((r) => {
      const list = (r as any).items ?? [];
      setItems(list);
      setTotal((r as any).meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  const save = () => {
    // Validar campos requeridos según el DTO del backend
    const nombresTrim = form.nombres?.trim() || "";
    const apellidosTrim = form.apellidos?.trim() || "";
    const tipoIdentificacion = form.tipo_identificacion || "Cédula";
    const numeroIdentificacionTrim = form.numero_identificacion?.trim() || "";
    
    if (!nombresTrim || nombresTrim.length < 1 || nombresTrim.length > 100) {
      alert("El campo Nombres es requerido y debe tener entre 1 y 100 caracteres");
      return;
    }
    
    if (!apellidosTrim || apellidosTrim.length < 1 || apellidosTrim.length > 100) {
      alert("El campo Apellidos es requerido y debe tener entre 1 y 100 caracteres");
      return;
    }
    
    if (!tipoIdentificacion || tipoIdentificacion.length < 1 || tipoIdentificacion.length > 20) {
      alert("El campo Tipo de identificación es requerido y debe tener entre 1 y 20 caracteres");
      return;
    }
    
    if (!numeroIdentificacionTrim || numeroIdentificacionTrim.length < 1 || numeroIdentificacionTrim.length > 20) {
      alert("El campo Número de identificación es requerido y debe tener entre 1 y 20 caracteres");
      return;
    }
    
    // Validar correo si se proporciona (debe ser email válido y entre 1-120 caracteres)
    const correoTrim = form.correo?.trim() || "";
    if (correoTrim) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoTrim)) {
        alert("El correo electrónico no es válido");
        return;
      }
      if (correoTrim.length > 120) {
        alert("El correo electrónico no puede tener más de 120 caracteres");
        return;
      }
    }
    
    // Validar teléfono si se proporciona (1-20 caracteres)
    const telefonoTrim = form.telefono?.trim() || "";
    if (telefonoTrim && (telefonoTrim.length < 1 || telefonoTrim.length > 20)) {
      alert("El teléfono debe tener entre 1 y 20 caracteres");
      return;
    }
    
    // Validar departamento si se proporciona (1-50 caracteres)
    const departamentoTrim = form.departamento?.trim() || "";
    if (departamentoTrim && (departamentoTrim.length < 1 || departamentoTrim.length > 50)) {
      alert("El departamento debe tener entre 1 y 50 caracteres");
      return;
    }
    
    // Preparar datos para enviar según el DTO del backend
    const prepareData = (data: Partial<Empleado>) => {
      const prepared: any = {
        nombres: nombresTrim,
        apellidos: apellidosTrim,
        tipo_identificacion: tipoIdentificacion,
        numero_identificacion: numeroIdentificacionTrim,
      };
      
      // Campos opcionales: solo incluir si tienen valor válido (no enviar strings vacíos)
      // El backend valida con @Length(1, ...) así que no podemos enviar strings vacíos
      if (correoTrim && correoTrim.length >= 1) {
        prepared.correo = correoTrim;
      }
      if (telefonoTrim && telefonoTrim.length >= 1) {
        prepared.telefono = telefonoTrim;
      }
      if (departamentoTrim && departamentoTrim.length >= 1) {
        prepared.departamento = departamentoTrim;
      }
      
      return prepared;
    };
    
    if (sel) {
      // Al actualizar, excluir id_empleado del body ya que va en la URL
      const { id_empleado, ...updateData } = form;
      const preparedData = prepareData(updateData);
      s.updateEmpleado(sel.id_empleado, preparedData)
        .then(() => { 
          setOpen(false);
          setForm(empty);
          load(); 
        })
        .catch((e) => {
          const errorMsg = e?.response?.data?.message || e?.message || "Error al actualizar empleado";
          console.error("Error al actualizar empleado:", e);
          console.error("Datos enviados:", preparedData);
          alert(errorMsg);
        });
    } else {
      // Al crear, excluir id_empleado si existe
      const { id_empleado, ...formSinId } = form;
      const preparedData = prepareData(formSinId);
      console.log("📤 Creando empleado con datos:", preparedData);
      s.createEmpleado(preparedData)
        .then((empleadoCreado) => { 
          console.log("✅ Empleado creado exitosamente:", empleadoCreado);
          setOpen(false);
          setForm(empty);
          // Recargar la lista - asegurar que se muestre en la primera página si es necesario
          setPage(1);
          load();
        })
        .catch((e) => {
          const errorMsg = e?.response?.data?.message || e?.message || "Error al crear empleado";
          const status = e?.response?.status;
          console.error("❌ Error al crear empleado:", {
            status,
            message: errorMsg,
            error: e,
            datosEnviados: preparedData,
            responseData: e?.response?.data
          });
          alert(`Error al crear empleado: ${errorMsg}\n\nRevisa la consola para más detalles.`);
        });
    }
  };

  const del = (row: Empleado) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    s.deleteEmpleado(row.id_empleado).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const handleView = (row: Empleado) => { setSel(row); setOpenView(true); };

  return (
    <>
      <DataTable 
        title="Empleados (Asesores)" 
        columns={cols} 
        rows={items} 
        total={total} 
        page={page} 
        rowsPerPage={limit}
        onPageChange={setPage} 
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm(empty); setOpen(true); }}
        onView={handleView}
        onEdit={(r) => { setSel(r); setForm({ ...r }); setOpen(true); }}
        onDelete={del} 
        searchPlaceholder="Buscar empleados..."
        getId={(r) => r.id_empleado} 
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar empleado" : "Nuevo empleado"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Teléfono" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField margin="dense" fullWidth label="Departamento" value={form.departamento ?? ""} onChange={(e) => setForm({ ...form, departamento: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <EmpleadoViewModal open={openView} onClose={() => setOpenView(false)} empleado={sel} />
    </>
  );
}
