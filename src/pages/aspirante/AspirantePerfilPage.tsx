import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as clienteService from "../../services/cliente.service";
import { useAuth } from "../../context/AuthContext";

export default function AspirantePerfilPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id_cliente) return;
    clienteService.getCliente(user.id_cliente).then(setForm).catch(() => setForm({})).finally(() => setLoading(false));
  }, [user?.id_cliente]);

  const save = () => {
    if (!user?.id_cliente || !form.nombres || !form.apellidos || !form.numero_identificacion) return;
    setSaving(true);
    clienteService.updateCliente(user.id_cliente, form).then(() => alert("Perfil actualizado")).catch((e) => alert(e?.response?.data?.message || "Error")).finally(() => setSaving(false));
  };

  if (loading) return <Typography>Cargando...</Typography>;
  if (!form.id_cliente) return <Typography>No tienes perfil de cliente asociado.</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Mi perfil</Typography>
      <Card sx={{ maxWidth: 500, borderRadius: 2 }}>
        <CardContent>
          <TextField margin="dense" fullWidth label="Nombres" value={form.nombres ?? ""} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Apellidos" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          <TextField margin="dense" fullWidth select label="Tipo identificación" value={form.tipo_identificacion ?? "Cédula"} onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}>
            <MenuItem value="Cédula">Cédula</MenuItem><MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </TextField>
          <TextField margin="dense" fullWidth label="Número identificación" value={form.numero_identificacion ?? ""} onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })} required />
          <TextField margin="dense" fullWidth label="Correo" type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
          <TextField margin="dense" fullWidth label="Teléfono" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <TextField margin="dense" fullWidth label="Celular" value={form.celular ?? ""} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
          <TextField margin="dense" fullWidth label="Nacionalidad" value={form.nacionalidad ?? ""} onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })} />
          <TextField margin="dense" fullWidth label="Fecha nacimiento" type="date" InputLabelProps={{ shrink: true }} value={form.fecha_nacimiento?.toString().slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
          <Button variant="contained" onClick={save} disabled={saving} sx={{ mt: 2 }}>Guardar cambios</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
