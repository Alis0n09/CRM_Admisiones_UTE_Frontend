import { Dialog, DialogActions, DialogContent, DialogTitle, Button, MenuItem, TextField, Avatar, Chip, Box, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable, { type Column } from "../../components/DataTable";
import ClienteViewModal from "../../components/ClienteViewModal";
import * as s from "../../services/cliente.service";
import type { Cliente } from "../../services/cliente.service";

const cols: Column<Cliente>[] = [
  {
    id: "aspirante",
    label: "ASPIRANTE",
    minWidth: 250,
    format: (_, row: Cliente) => {
      const initials = `${row.nombres?.[0] || ""}${row.apellidos?.[0] || ""}`.toUpperCase();
      return (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "#3b82f6", width: 40, height: 40, fontSize: "0.875rem", fontWeight: 600 }}>
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
  { id: "celular", label: "CELULAR", minWidth: 120 },
  {
    id: "estado",
    label: "ESTADO",
    minWidth: 100,
    format: (v: string) => (
      <Chip
        label={v || "Nuevo"}
        size="small"
        sx={{
          bgcolor: "#3b82f6",
          color: "white",
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    ),
  },
];

const empty: Partial<Cliente> = { nombres: "", apellidos: "", tipo_identificacion: "Cédula", numero_identificacion: "", origen: "Web", estado: "Nuevo" };

export default function AsesorClientesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sel, setSel] = useState<Cliente | null>(null);
  const [form, setForm] = useState<Partial<Cliente>>(empty);

  // Sincronizar el estado de búsqueda con el parámetro de la URL cuando cambia la URL
  useEffect(() => {
    const urlSearchParam = searchParams.get("search") || "";
    if (urlSearchParam !== search) {
      setSearch(urlSearchParam);
      setPage(1);
    }
  }, [searchParams]);

  const load = useCallback(() => {
    const currentSearch = searchParams.get("search") || search || "";
    const searchParam = currentSearch.trim();
    // Pasar el parámetro de búsqueda solo si tiene contenido
    const params: { page: number; limit: number; search?: string } = { page, limit };
    if (searchParam) {
      params.search = searchParam;
    }
    s.getClientes(params).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch((err) => {
      console.error("Error en búsqueda:", err);
      setItems([]);
      setTotal(0);
    });
  }, [page, limit, search, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    // Actualizar URL sin recargar la página
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleView = (row: Cliente) => { setSel(row); setOpenView(true); };

  const save = () => {
    if (!form.nombres || !form.apellidos || !form.numero_identificacion || !form.origen) return;
    (sel ? s.updateCliente(sel.id_cliente, form) : s.createCliente(form as any))
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  return (
    <>
      <DataTable
        title="Mis Aspirantes"
        columns={cols}
        rows={items}
        total={total}
        page={page}
        rowsPerPage={limit}
        onPageChange={setPage}
        onRowsPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onAdd={() => {
          setSel(null);
          setForm(empty);
          setOpen(true);
        }}
        onView={handleView}
        onEdit={(r) => {
          setSel(r);
          setForm({ ...r });
          setOpen(true);
        }}
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar aspirantes..."
        getId={(r) => r.id_cliente}
      />
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{sel ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Celular" value={form.celular ?? ""} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
          <TextField margin="dense" fullWidth label="Origen" value={form.origen ?? ""} onChange={(e) => setForm({ ...form, origen: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Estado" value={form.estado ?? "Nuevo"} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            <MenuItem value="Nuevo">Nuevo</MenuItem><MenuItem value="En proceso">En proceso</MenuItem><MenuItem value="Matriculado">Matriculado</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <ClienteViewModal open={openView} onClose={() => setOpenView(false)} cliente={sel} />
    </>
  );
}
