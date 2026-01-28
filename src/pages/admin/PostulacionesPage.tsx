import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Avatar, Box, Chip, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import PostulacionViewModal from "../../components/PostulacionViewModal";
import * as postulacionService from "../../services/postulacion.service";
import * as clienteService from "../../services/cliente.service";
import * as carreraService from "../../services/carrera.service";
import type { Postulacion } from "../../services/postulacion.service";
import School from "@mui/icons-material/School";

function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("revisión")) return "info";
  if (estadoLower.includes("aprobada")) return "success";
  if (estadoLower.includes("rechazada")) return "error";
  return "default";
}

const cols: Column<Postulacion>[] = [
  { 
    id: "cliente", 
    label: "Aspirante", 
    minWidth: 200, 
    format: (_, r) => r.cliente ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#3b82f6", width: 40, height: 40, fontSize: "0.875rem" }}>
          {getInitials(r.cliente.nombres, r.cliente.apellidos)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {r.cliente.nombres} {r.cliente.apellidos}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {r.id_postulacion.slice(0, 8)}
          </Typography>
        </Box>
      </Box>
    ) : "-" 
  },
  { 
    id: "carrera", 
    label: "Carrera", 
    minWidth: 200, 
    format: (_, r) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <School sx={{ color: "#8b5cf6", fontSize: 20 }} />
        <Typography variant="body2">{r.carrera?.nombre_carrera ?? "-"}</Typography>
      </Box>
    )
  },
  { id: "periodo_academico", label: "Período", minWidth: 120 },
  { id: "fecha_postulacion", label: "Fecha", minWidth: 120 },
  { 
    id: "estado_postulacion", 
    label: "Estado", 
    minWidth: 140,
    format: (v) => (
      <Chip 
        label={v || "Pendiente"} 
        size="small" 
        color={getEstadoColor(v) as any}
        sx={{ fontWeight: 600 }}
      />
    )
  },
];

export default function PostulacionesPage() {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [carreras, setCarreras] = useState<{ id_carrera: string; nombre_carrera: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
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
  const handleView = (r: Postulacion) => { setSel(r); setOpenView(true); };
  const openEdit = (r: Postulacion) => { setSel(r); setForm({ id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", id_carrera: (r.carrera as any)?.id_carrera || r.id_carrera || "", periodo_academico: (r as any).periodo_academico || "", estado_postulacion: r.estado_postulacion || "Pendiente", observaciones: r.observaciones || "" }); setOpen(true); };

  const save = () => {
    if (!form.id_cliente || !form.id_carrera || !form.periodo_academico) { alert("Completa cliente, carrera y período"); return; }
    if (sel) {
      // Para actualizar, solo enviar los campos que pueden modificarse
      const updateData = {
        periodo_academico: form.periodo_academico,
        estado_postulacion: form.estado_postulacion,
        observaciones: form.observaciones,
      };
      postulacionService.updatePostulacion(sel.id_postulacion, updateData)
        .then(() => { 
          setOpen(false); 
          load();
          // Disparar evento para actualizar otras páginas que usan postulaciones
          window.dispatchEvent(new CustomEvent("postulacionesUpdated"));
        })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    } else {
      // Para crear, enviar todos los campos necesarios
      postulacionService.createPostulacion(form)
        .then(() => { 
          setOpen(false); 
          load();
          // Disparar evento para actualizar otras páginas que usan postulaciones
          window.dispatchEvent(new CustomEvent("postulacionesUpdated"));
        })
        .catch((e) => alert(e?.response?.data?.message || "Error"));
    }
  };

  const del = async (row: Postulacion) => {
    if (!confirm("¿Eliminar esta postulación?")) return;
    
    // Obtener el ID de múltiples formas posibles
    const idPostulacion = row.id_postulacion || (row as any).id_postulacion || (row as any).id || (row as any)._id;
    
    console.log("🔍 Objeto row completo:", row);
    console.log("🔍 ID obtenido:", idPostulacion);
    console.log("🔍 Tipo del ID:", typeof idPostulacion);
    
    if (!idPostulacion) {
      console.error("Error: No se pudo obtener el ID de la postulación", row);
      alert("Error: No se pudo obtener el ID de la postulación. Revisa la consola para más detalles.");
      return;
    }
    
    // Limpiar el ID: convertir a string, eliminar espacios y caracteres no válidos
    let idString = String(idPostulacion)
      .trim()
      .replace(/\s+/g, '') // Eliminar todos los espacios
      .replace(/[^\w-]/g, ''); // Eliminar caracteres especiales excepto guiones y alfanuméricos
    
    if (!idString || idString === "undefined" || idString === "null" || idString.length < 8) {
      console.error("Error: ID de postulación inválido", { idPostulacion, idString, row });
      alert("Error: ID de postulación inválido. Revisa la consola para más detalles.");
      return;
    }
    
    // Verificar primero que la postulación existe antes de intentar eliminarla
    try {
      console.log("🔍 Verificando que la postulación existe antes de eliminar...");
      const postulacionExistente = await postulacionService.getPostulacion(idString);
      console.log("📋 Postulación encontrada:", postulacionExistente);
      
      if (!postulacionExistente) {
        alert(`La postulación con ID ${idString} no existe en el servidor.`);
        load(); // Recargar la lista por si acaso
        return;
      }
    } catch (verifyError: any) {
      console.warn("⚠️ No se pudo verificar la existencia de la postulación:", verifyError);
      // Continuar con la eliminación de todas formas
    }
    
    console.log("📤 Intentando eliminar postulación:");
    console.log("  - ID original:", idPostulacion);
    console.log("  - ID limpio:", idString);
    console.log("  - URL completa:", `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/postulacion/${idString}`);
    
    postulacionService.deletePostulacion(idString)
      .then((result) => { 
        console.log("✅ Postulación eliminada exitosamente:", result);
        load();
        // Disparar evento para actualizar otras páginas que usan postulaciones
        window.dispatchEvent(new CustomEvent("postulacionesUpdated"));
      })
      .catch((e: any) => {
        const status = e?.response?.status;
        const errorMsg = e?.response?.data?.message || e?.message || "Error al eliminar la postulación";
        const url = e?.config?.url || e?.request?.responseURL || "URL desconocida";
        const responseData = e?.response?.data;
        
        console.error("❌ Error al eliminar postulación:", {
          idOriginal: idPostulacion,
          idLimpio: idString,
          status,
          url,
          method: e?.config?.method || "DELETE",
          error: e,
          response: responseData,
          responseMessage: responseData?.message,
          row: row
        });
        
        if (status === 404) {
          const backendMessage = responseData?.message || "No se encontró la postulación";
          alert(`Postulación no encontrada (ID: ${idString}).\n\nMensaje del backend: ${backendMessage}\n\nPosibles causas:\n- La postulación ya fue eliminada\n- El ID no existe en la base de datos\n- El método remove() del servicio no encuentra la postulación\n- Verifica en el backend que el campo id_postulacion en la entidad Postulacion esté correctamente configurado\n\nRevisa la consola para más detalles.`);
        } else if (status === 403) {
          alert("No tienes permisos para eliminar esta postulación.");
        } else if (status === 401) {
          alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          alert(`Error al eliminar la postulación: ${errorMsg}\n\nRevisa la consola para más detalles.`);
        }
      });
  };

  return (
    <>
      <DataTable title="Postulaciones" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} onView={handleView} onEdit={openEdit} onDelete={del} getId={(r) => r.id_postulacion} />
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
      <PostulacionViewModal open={openView} onClose={() => setOpenView(false)} postulacion={sel} />
    </>
  );
}
