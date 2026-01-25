import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Avatar, Box, Chip, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import SeguimientoViewModal from "../../components/SeguimientoViewModal";
import * as seguimientoService from "../../services/seguimiento.service";
import * as clienteService from "../../services/cliente.service";
import type { Seguimiento } from "../../services/seguimiento.service";
import Phone from "@mui/icons-material/Phone";
import Email from "@mui/icons-material/Email";
import WhatsApp from "@mui/icons-material/WhatsApp";
import Person from "@mui/icons-material/Person";

function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

function getMedioIcon(medio?: string) {
  const medioLower = medio?.toLowerCase() || "";
  if (medioLower.includes("llamada")) return <Phone sx={{ fontSize: 18, color: "#10b981" }} />;
  if (medioLower.includes("email")) return <Email sx={{ fontSize: 18, color: "#3b82f6" }} />;
  if (medioLower.includes("whatsapp")) return <WhatsApp sx={{ fontSize: 18, color: "#25d366" }} />;
  if (medioLower.includes("presencial")) return <Person sx={{ fontSize: 18, color: "#8b5cf6" }} />;
  return <Phone sx={{ fontSize: 18 }} />;
}

const cols: Column<Seguimiento>[] = [
  { 
    id: "cliente", 
    label: "Cliente", 
    minWidth: 200, 
    format: (_, r) => r.cliente ? (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#8b5cf6", width: 40, height: 40, fontSize: "0.875rem" }}>
          {getInitials(r.cliente.nombres, r.cliente.apellidos)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {r.cliente.nombres} {r.cliente.apellidos}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {r.id_seguimiento.slice(0, 8)}
          </Typography>
        </Box>
      </Box>
    ) : "-" 
  },
  { 
    id: "fecha_contacto", 
    label: "Fecha Contacto", 
    minWidth: 140,
    format: (v) => v ? new Date(v).toLocaleDateString("es-ES") : "-"
  },
  { 
    id: "medio", 
    label: "Medio", 
    minWidth: 140,
    format: (v) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {getMedioIcon(v)}
        <Typography variant="body2">{v || "-"}</Typography>
      </Box>
    )
  },
  { 
    id: "comentarios", 
    label: "Comentarios", 
    minWidth: 200,
    format: (v) => (
      <Typography 
        variant="body2" 
        sx={{ 
          maxWidth: 250, 
          overflow: "hidden", 
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {v || "Sin comentarios"}
      </Typography>
    )
  },
  { 
    id: "proximo_paso", 
    label: "Próximo Paso", 
    minWidth: 180,
    format: (v) => v ? (
      <Chip 
        label={v}
        size="small"
        sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 600 }}
      />
    ) : (
      <Typography variant="body2" color="text.secondary">-</Typography>
    )
  },
];

const empty = { id_cliente: "", fecha_contacto: "", medio: "Llamada", comentarios: "", proximo_paso: "", fecha_proximo_contacto: "" };

export default function AsesorSeguimientosPage() {
  const [items, setItems] = useState<Seguimiento[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [clientes, setClientes] = useState<{ id_cliente: string; nombres: string; apellidos: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Seguimiento | null>(null);
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    seguimientoService.getSeguimientos({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);
  useEffect(() => { clienteService.getClientes({ limit: 200 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([])); }, []);

  const save = () => {
    if (!form.id_cliente) return;
    (sel ? seguimientoService.updateSeguimiento(sel.id_seguimiento, form) : seguimientoService.createSeguimiento(form))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable title="Seguimientos" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setSel(null); setForm({ ...empty, id_cliente: clientes[0]?.id_cliente || "", fecha_contacto: new Date().toISOString().slice(0, 10) }); setOpen(true); }}
        onView={(r) => { setSel(r); setOpenView(true); }}
        onEdit={(r) => { setSel(r); setForm({ id_cliente: (r.cliente as any)?.id_cliente || r.id_cliente || "", fecha_contacto: r.fecha_contacto?.toString().slice(0, 10) || "", medio: r.medio || "", comentarios: r.comentarios || "", proximo_paso: r.proximo_paso || "", fecha_proximo_contacto: r.fecha_proximo_contacto?.toString().slice(0, 10) || "" }); setOpen(true); }}
        getId={(r) => r.id_seguimiento} />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar seguimiento" : "Nuevo seguimiento"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente</InputLabel>
            <Select value={form.id_cliente} label="Cliente" onChange={(e) => setForm({ ...form, id_cliente: e.target.value })} required>
              {clientes.map((c) => <MenuItem key={c.id_cliente} value={c.id_cliente}>{c.nombres} {c.apellidos}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Fecha contacto" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_contacto} onChange={(e) => setForm({ ...form, fecha_contacto: e.target.value })} />
          <TextField margin="dense" fullWidth select label="Medio" value={form.medio} onChange={(e) => setForm({ ...form, medio: e.target.value })}>
            <MenuItem value="Llamada">Llamada</MenuItem><MenuItem value="Email">Email</MenuItem><MenuItem value="WhatsApp">WhatsApp</MenuItem><MenuItem value="Presencial">Presencial</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Comentarios" multiline value={form.comentarios} onChange={(e) => setForm({ ...form, comentarios: e.target.value })} />
          <TextField margin="dense" fullWidth label="Próximo paso" value={form.proximo_paso} onChange={(e) => setForm({ ...form, proximo_paso: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha próximo contacto" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_proximo_contacto} onChange={(e) => setForm({ ...form, fecha_proximo_contacto: e.target.value })} />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <SeguimientoViewModal open={openView} onClose={() => setOpenView(false)} seguimiento={sel} />
    </>
  );
}
