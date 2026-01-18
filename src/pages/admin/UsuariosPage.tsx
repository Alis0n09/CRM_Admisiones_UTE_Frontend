import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as usuarioService from "../../services/usuario.service";
import * as empleadoService from "../../services/empleado.service";
import * as clienteService from "../../services/cliente.service";
import * as rolService from "../../services/rol.service";
import type { Usuario } from "../../services/usuario.service";
import type { Empleado } from "../../services/empleado.service";
import type { Cliente } from "../../services/cliente.service";
import type { Rol } from "../../services/rol.service";

const cols: Column<Usuario>[] = [
  { id: "email", label: "Email", minWidth: 180 },
  { id: "activo", label: "Activo", minWidth: 80, format: (v) => v ? "Sí" : "No" },
  { id: "empleado", label: "Empleado", minWidth: 140, format: (_, r) => r.empleado ? `${r.empleado.nombres} ${r.empleado.apellidos}` : (r.id_empleado || "-") },
  { id: "cliente", label: "Cliente", minWidth: 140, format: (_, r) => r.cliente ? `${r.cliente.nombres} ${r.cliente.apellidos}` : (r.id_cliente || "-") },
];

export default function UsuariosPage() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [open, setOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [sel, setSel] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({ activo: true });
  const [createForm, setCreateForm] = useState<{ tipo: "empleado" | "cliente"; id: string; email: string; password: string; rolesIds: string[] }>({ tipo: "empleado", id: "", email: "", password: "", rolesIds: [] });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    usuarioService.getUsuarios().then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
    empleadoService.getEmpleados({ limit: 500 }).then((r: any) => setEmpleados(r?.items ?? [])).catch(() => setEmpleados([]));
    clienteService.getClientes({ limit: 500 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
  }, []);

  useEffect(() => {
    usuarioService.getUsuarios().then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
    empleadoService.getEmpleados({ limit: 500 }).then((r: any) => setEmpleados(r?.items ?? [])).catch(() => setEmpleados([]));
    clienteService.getClientes({ limit: 500 }).then((r: any) => setClientes(r?.items ?? [])).catch(() => setClientes([]));
    rolService.getRoles().then((r) => setRoles(Array.isArray(r) ? r : [])).catch(() => setRoles([]));
  }, []);

  const save = () => {
    if (!sel) return;
    usuarioService.updateUsuario(sel.id_usuario, { activo: form.activo })
      .then(() => { setOpen(false); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const saveCreate = () => {
    if (!createForm.email || !createForm.id) { alert("Completa email y " + (createForm.tipo === "empleado" ? "empleado" : "cliente")); return; }
    if (!createForm.password || createForm.password.length < 6) { alert("La contraseña es obligatoria y debe tener al menos 6 caracteres."); return; }
    if (!createForm.rolesIds?.length) { alert("Asigna al menos un rol (ADMIN, ASESOR o ASPIRANTE) para que el usuario pueda iniciar sesión."); return; }
    const body = { email: createForm.email, password: createForm.password, rolesIds: createForm.rolesIds };
    const fn = createForm.tipo === "empleado" ? () => usuarioService.createUsuarioEmpleado(createForm.id, body) : () => usuarioService.createUsuarioCliente(createForm.id, body);
    fn().then(() => { setOpenCreate(false); setCreateForm({ tipo: "empleado", id: "", email: "", password: "", rolesIds: [] }); load(); })
      .catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const del = (row: Usuario) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    usuarioService.deleteUsuario(row.id_usuario).then(() => load()).catch((e) => alert(e?.response?.data?.message || "Error"));
  };

  const paginated = items.slice((page - 1) * limit, page * limit);

  return (
    <>
      <DataTable title="Usuarios" columns={cols} rows={paginated} total={items.length} page={page} rowsPerPage={limit}
        onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
        onAdd={() => { setCreateForm({ tipo: "empleado", id: "", email: "", password: "", rolesIds: [] }); setOpenCreate(true); }}
        onEdit={(r) => { setSel(r); setForm({ activo: r.activo }); setOpen(true); }}
        onDelete={del} getId={(r) => r.id_usuario} />
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <TextField margin="dense" fullWidth label="Email" value={sel?.email} InputProps={{ readOnly: true }} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Activo</InputLabel>
            <Select value={form.activo ? "1" : "0"} label="Activo" onChange={(e) => setForm({ ...form, activo: e.target.value === "1" })}>
              <MenuItem value="1">Sí</MenuItem><MenuItem value="0">No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Cancelar</Button><Button variant="contained" onClick={save}>Guardar</Button></DialogActions>
      </Dialog>
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo usuario</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Tipo</InputLabel>
            <Select value={createForm.tipo} label="Tipo" onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value as any, id: "" })}>
              <MenuItem value="empleado">Empleado</MenuItem><MenuItem value="cliente">Cliente</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>{createForm.tipo === "empleado" ? "Empleado" : "Cliente"}</InputLabel>
            <Select value={createForm.id} label={createForm.tipo === "empleado" ? "Empleado" : "Cliente"} onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}>
              {(createForm.tipo === "empleado" ? empleados : clientes).map((x) => (
                <MenuItem key={(x as any).id_empleado || (x as any).id_cliente} value={(x as any).id_empleado || (x as any).id_cliente}>
                  {(x as any).nombres} {(x as any).apellidos}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Roles (al menos uno)</InputLabel>
            <Select multiple value={createForm.rolesIds} label="Roles (al menos uno)" onChange={(e) => setCreateForm({ ...createForm, rolesIds: e.target.value as string[] })} renderValue={(v) => roles.filter((r) => v.includes(r.id_rol)).map((r) => r.nombre).join(", ") || "Selecciona"} required>
              {roles.map((r) => (
                <MenuItem key={r.id_rol} value={r.id_rol}>{r.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField margin="dense" fullWidth label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Contraseña" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required helperText="Mínimo 6 caracteres" />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenCreate(false)}>Cancelar</Button><Button variant="contained" onClick={saveCreate}>Crear</Button></DialogActions>
      </Dialog>
    </>
  );
}
