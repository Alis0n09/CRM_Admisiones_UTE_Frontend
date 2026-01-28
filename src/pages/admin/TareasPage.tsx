import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import TareaViewModal from "../../components/TareaViewModal";
import * as tareaService from "../../services/tarea.service";
import * as empleadoService from "../../services/empleado.service";
import * as clienteService from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";
import * as carreraService from "../../services/carrera.service";
import type { TareaCrm } from "../../services/tarea.service";

const cols: Column<TareaCrm>[] = [
  { id: "descripcion", label: "Descripción", minWidth: 180 },
  { id: "empleado", label: "Asesor", minWidth: 140, format: (_, r) => r.empleado ? `${r.empleado.nombres} ${r.empleado.apellidos}` : "-" },
  { id: "cliente", label: "Cliente", minWidth: 140, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : "-" },
  { id: "fecha_asignacion", label: "Asignación", minWidth: 100 },
  { id: "fecha_vencimiento", label: "Vencimiento", minWidth: 100 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

export default function TareasPage() {
  const [items, setItems] = useState<TareaCrm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [empleados, setEmpleados] = useState<{ id_empleado: string; nombres: string; apellidos: string }[]>([]);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<TareaCrm | null>(null);
  const [form, setForm] = useState<{ id_empleado: string; id_cliente: string; descripcion: string; fecha_asignacion: string; fecha_vencimiento: string; estado: string }>({ id_empleado: "", id_cliente: "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" });

  const load = useCallback(() => {
    tareaService.getTareas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => {
    empleadoService.getEmpleados({ limit: 200 }).then((r: any) => setEmpleados(r?.items ?? [])).catch(() => setEmpleados([]));
    clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
    carreraService.getCarreras({ limit: 200 }).then((r: any) => setCarreras(r?.items ?? [])).catch(() => setCarreras([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_empleado: empleados[0]?.id_empleado || "", id_cliente: clientes[0]?.id_cliente || "", descripcion: "", fecha_asignacion: "", fecha_vencimiento: "", estado: "Pendiente" }); setOpen(true); };
  const handleView = (r: TareaCrm) => { setSel(r); setOpenView(true); };
  const openEdit = (r: TareaCrm) => { setSel(r); setForm({ id_empleado: (r.empleado as any)?.id_empleado || r.id_empleado || "", id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", descripcion: r.descripcion || "", fecha_asignacion: r.fecha_asignacion || "", fecha_vencimiento: r.fecha_vencimiento || "", estado: r.estado || "Pendiente" }); setOpen(true); };

  const save = async () => {
    if (!form.id_empleado || !form.id_cliente || !form.descripcion) { alert("Completa empleado, cliente y descripción"); return; }
    
    const estadoAnterior = sel?.estado || "";
    const estadoNuevo = form.estado;
    const seCompleto = estadoNuevo === "Completada" && estadoAnterior !== "Completada";
    const idCliente = String(form.id_cliente || "");
    
    try {
      if (sel) {
        await tareaService.updateTarea(sel.id_tarea, form);
        
        // Si se marcó como completada, crear postulación automáticamente
        if (seCompleto) {
          await crearPostulacionAutomatica(idCliente);
        }
        
        setOpen(false);
        load();
      } else {
        await tareaService.createTarea(form);
        
        // Si se crea como completada, crear postulación automáticamente
        if (estadoNuevo === "Completada") {
          await crearPostulacionAutomatica(idCliente);
        }
        
        setOpen(false);
        load();
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  const crearPostulacionAutomatica = async (idCliente: string) => {
    try {
      console.log("🔄 Verificando si se debe crear postulación automática para cliente:", idCliente);
      
      // Verificar si ya existe una postulación para este cliente
      const postulacionesExistentes = await postulacionService.getPostulaciones({ id_cliente: idCliente });
      const listaPostulaciones = Array.isArray(postulacionesExistentes) 
        ? postulacionesExistentes 
        : (postulacionesExistentes as any)?.items || [];
      
      if (listaPostulaciones.length > 0) {
        console.log(`ℹ️ Ya existe ${listaPostulaciones.length} postulación(es) para este cliente, no se creará una nueva`);
        return;
      }

      // Obtener la primera carrera disponible
      if (carreras.length === 0) {
        console.warn("⚠️ No hay carreras disponibles para crear la postulación");
        alert("⚠️ No se pudo crear la postulación automáticamente: No hay carreras disponibles en el sistema.");
        return;
      }

      const primeraCarrera = carreras[0];
      const añoActual = new Date().getFullYear();
      const mesActual = new Date().getMonth() + 1; // 1-12
      const periodoAcademico = mesActual >= 1 && mesActual <= 6 ? `${añoActual}-1` : `${añoActual}-2`;

      console.log("📝 Creando postulación automática:", {
        id_cliente: idCliente,
        id_carrera: primeraCarrera.id_carrera,
        carrera: primeraCarrera.nombre_carrera,
        periodo_academico: periodoAcademico
      });

      const nuevaPostulacion = await postulacionService.createPostulacion({
        id_cliente: idCliente,
        id_carrera: primeraCarrera.id_carrera,
        periodo_academico: periodoAcademico,
        estado_postulacion: "Pendiente",
        observaciones: "Postulación creada automáticamente al completar la tarea"
      });

      console.log(`✅ Postulación creada automáticamente para el cliente ${idCliente}:`, nuevaPostulacion);
      
      // Mostrar mensaje de éxito al usuario
      alert(`✅ Tarea completada exitosamente.\n\n📋 Se ha creado automáticamente una postulación para este cliente:\n- Carrera: ${primeraCarrera.nombre_carrera}\n- Período: ${periodoAcademico}\n- Estado: Pendiente`);
    } catch (error: any) {
      console.error("❌ Error al crear postulación automática:", error?.response?.data || error);
      const errorMsg = error?.response?.data?.message || error?.message || "Error desconocido";
      alert(`⚠️ La tarea se completó, pero no se pudo crear la postulación automáticamente.\n\nError: ${errorMsg}\n\nPuedes crear la postulación manualmente desde la sección de Postulaciones.`);
    }
  };

  const del = (row: TareaCrm) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    tareaService.deleteTarea(row.id_tarea).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Tareas CRM" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onView={handleView} onEdit={openEdit} onDelete={del} getId={(r) => r.id_tarea} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Asesor (empleado)</InputLabel>
            <Select value={form.id_empleado} label="Asesor (empleado)" onChange={(e) => setForm({ ...form, id_empleado: e.target.value })} required>
              {empleados.map((e) => <MenuItem key={e.id_empleado} value={e.id_empleado}>{e.nombres} {e.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Descripción" multiline value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Fecha asignación" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_asignacion} onChange={(e) => setForm({ ...form, fecha_asignacion: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha vencimiento" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem><MenuItem value="En proceso">En proceso</MenuItem><MenuItem value="Completada">Completada</MenuItem><MenuItem value="Cancelada">Cancelada</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <TareaViewModal open={openView} onClose={() => setOpenView(false)} tarea={sel} />
    </>
  );
}
