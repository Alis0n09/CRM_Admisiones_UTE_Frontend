import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import DocumentoViewModal from "../../components/DocumentoViewModal";
import * as docService from "../../services/documentoPostulacion.service";
import * as postulacionService from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import School from "@mui/icons-material/School";

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("aprobado")) return "success";
  if (estadoLower.includes("rechazado")) return "error";
  return "default";
}

export default function DocumentosPage() {
  const [items, setItems] = useState<DocumentoPostulacion[]>([]);
  const [postulaciones, setPostulaciones] = useState<{ id_postulacion: string; cliente?: { nombres: string }; carrera?: { nombre_carrera: string } }[]>([]);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<DocumentoPostulacion | null>(null);
  const [form, setForm] = useState<{ id_postulacion: string; tipo_documento: string; nombre_archivo: string; url_archivo: string; estado_documento: string; observaciones: string }>({ id_postulacion: "", tipo_documento: "Cédula", nombre_archivo: "", url_archivo: "", estado_documento: "Pendiente", observaciones: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    docService.getDocumentosPostulacion()
      .then((r) => {
        const docs = Array.isArray(r) ? r : [];
        setItems(docs);
      })
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    load();
    const handleDocumentosUpdated = () => load();
    window.addEventListener("documentosUpdated", handleDocumentosUpdated);
    return () => window.removeEventListener("documentosUpdated", handleDocumentosUpdated);
  }, [load]);

  useEffect(() => {
    postulacionService.getPostulaciones({ limit: 500 }).then((r: any) => setPostulaciones(r?.items ?? (Array.isArray(r) ? r : []))).catch(() => setPostulaciones([]));
  }, []);

  const openAdd = () => { setSel(null); setForm({ id_postulacion: postulaciones[0]?.id_postulacion || "", tipo_documento: "Cédula", nombre_archivo: "", url_archivo: "", estado_documento: "Pendiente", observaciones: "" }); setOpen(true); };
  const handleView = (r: DocumentoPostulacion) => { setSel(r); setOpenView(true); };
  const openEdit = (r: DocumentoPostulacion) => { setSel(r); setForm({ id_postulacion: r.id_postulacion, tipo_documento: r.tipo_documento, nombre_archivo: r.nombre_archivo, url_archivo: r.url_archivo, estado_documento: r.estado_documento || "Pendiente", observaciones: r.observaciones || "" }); setOpen(true); };

  const save = () => {
    if (!form.id_postulacion || !form.tipo_documento || !form.nombre_archivo || !form.url_archivo) {
      alert("Completa los campos requeridos: Postulación, Tipo, Nombre archivo y URL archivo");
      return;
    }
    
    const documentoData = {
      id_postulacion: form.id_postulacion,
      tipo_documento: form.tipo_documento,
      nombre_archivo: form.nombre_archivo,
      url_archivo: form.url_archivo,
      estado_documento: form.estado_documento || "Pendiente",
      observaciones: form.observaciones || "",
    };

    (sel 
      ? docService.updateDocumentoPostulacion(sel.id_documento, documentoData)
      : docService.createDocumentoPostulacion(documentoData)
    )
      .then(() => {
        setOpen(false);
        load();
        window.dispatchEvent(new CustomEvent("documentosUpdated"));
      })
      .catch((e) => alert(e?.response?.data?.message || "Error al guardar el documento"));
  };

  const del = (row: DocumentoPostulacion) => {
    if (!confirm("¿Eliminar este documento?")) return;
    docService.deleteDocumentoPostulacion(row.id_documento)
      .then(() => load())
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const cols = useMemo<Column<DocumentoPostulacion>[]>(() => [
    {
      id: "tipo_documento",
      label: "TIPO DE DOCUMENTO",
      minWidth: 180,
    },
    {
      id: "nombre_archivo",
      label: "ARCHIVO",
      minWidth: 200,
    },
    {
      id: "postulacion",
      label: "POSTULACIÓN",
      minWidth: 200,
      format: (_, r) => r.postulacion ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <School sx={{ color: "#8b5cf6", fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {r.postulacion?.carrera?.nombre_carrera || "-"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {String((r.postulacion as any).id_postulacion || r.id_postulacion || "").slice(0, 8)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2">#{String(r.id_postulacion || "").slice(0, 8)}</Typography>
      ),
    },
    {
      id: "estado_documento",
      label: "ESTADO",
      minWidth: 140,
      format: (v) => (
        <Chip 
          label={v || "Pendiente"} 
          size="small" 
          color={getEstadoColor(v) as any}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
  ], []);

  return (
    <>
      <DataTable 
        title="Documentos de postulación" 
        columns={cols} 
        rows={items.slice((page - 1) * limit, page * limit)} 
        total={items.length} 
        page={page} 
        rowsPerPage={limit}
        onPageChange={setPage} 
        onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={openAdd} 
        onView={handleView} 
        onEdit={openEdit} 
        onDelete={del} 
        getId={(r) => r.id_documento} 
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar documento" : "Nuevo documento"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Postulación</InputLabel>
            <Select value={form.id_postulacion} label="Postulación" onChange={(e) => setForm({ ...form, id_postulacion: e.target.value })} required>
              {postulaciones.map((p) => <MenuItem key={p.id_postulacion} value={p.id_postulacion}>Post. {p.id_postulacion.slice(0, 8)} - {p.carrera?.nombre_carrera}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth select label="Tipo" value={form.tipo_documento} onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem>
            <MenuItem value="Título">Título</MenuItem>
            <MenuItem value="Certificado">Certificado</MenuItem>
            <MenuItem value="Foto">Foto</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Nombre archivo" value={form.nombre_archivo} onChange={(e) => setForm({ ...form, nombre_archivo: e.target.value })} required />
          <TextField margin="dense" fullWidth label="URL archivo" value={form.url_archivo} onChange={(e) => setForm({ ...form, url_archivo: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado_documento} onChange={(e) => setForm({ ...form, estado_documento: e.target.value })}>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="Aprobado">Aprobado</MenuItem>
            <MenuItem value="Rechazado">Rechazado</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Observaciones" multiline value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={save}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <DocumentoViewModal open={openView} onClose={() => setOpenView(false)} documento={sel} />
    </>
  );
}
