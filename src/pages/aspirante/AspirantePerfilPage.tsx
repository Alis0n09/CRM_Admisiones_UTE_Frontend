import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  MenuItem, 
  TextField, 
  Typography, 
  Avatar, 
  Stack, 
  CircularProgress,
  Alert,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { useEffect, useState } from "react";
import * as clienteService from "../../services/cliente.service";
import { useAuth } from "../../context/AuthContext";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PublicIcon from "@mui/icons-material/Public";
import SaveIcon from "@mui/icons-material/Save";

export default function AspirantePerfilPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    if (!user?.id_cliente) {
      setLoading(false);
      return;
    }
    clienteService.getCliente(user.id_cliente)
      .then(setForm)
      .catch(() => setForm({}))
      .finally(() => setLoading(false));
  }, [user?.id_cliente]);

  const save = () => {
    if (!user?.id_cliente || !form.nombres || !form.apellidos || !form.numero_identificacion) {
      setSnackbar({ open: true, message: "Por favor completa los campos requeridos", severity: "error" });
      return;
    }
    setSaving(true);
    // Enviar solo campos permitidos por el DTO de actualización (evita errores tipo:
    // "property id_cliente/fecha_registro/estado should not exist")
    const origen = String(form.origen ?? "").trim() || "Web";
    const updatePayload = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      tipo_identificacion: form.tipo_identificacion,
      numero_identificacion: form.numero_identificacion,
      correo: form.correo,
      telefono: form.telefono,
      celular: form.celular,
      nacionalidad: form.nacionalidad,
      fecha_nacimiento: form.fecha_nacimiento,
      origen,
    };

    clienteService.updateCliente(user.id_cliente, updatePayload)
      .then(() => {
        setSnackbar({ open: true, message: "Perfil actualizado exitosamente", severity: "success" });
      })
      .catch((e) => {
        setSnackbar({ open: true, message: e?.response?.data?.message || "Error al actualizar el perfil", severity: "error" });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!form.id_cliente) {
    return (
      <Alert severity="warning">
        No tienes perfil de cliente asociado. Por favor contacta al administrador.
      </Alert>
    );
  }

  const nombreCompleto = `${form.nombres || ""} ${form.apellidos || ""}`.trim() || "Usuario";
  const iniciales = nombreCompleto
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <Box>
      {/* Header con Avatar (como estaba) */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 2, background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)" }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 70,
                height: 70,
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontSize: 28,
                fontWeight: 700,
                border: "3px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {iniciales}
            </Avatar>
            <Box sx={{ flex: 1, color: "white" }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {nombreCompleto}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.25 }}>
                {form.correo || user?.email || "Sin correo especificado"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {form.numero_identificacion ? `${form.tipo_identificacion || "Cédula"}: ${form.numero_identificacion}` : "Sin identificación"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Formulario de Edición - Organizado en secciones */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* Sección: Datos Básicos */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <PersonIcon sx={{ mr: 0.75, color: "#3b82f6", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Datos Básicos
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Nombres <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.nombres ?? ""}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  required
                  placeholder="Ingresa tus nombres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Apellidos <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.apellidos ?? ""}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                  required
                  placeholder="Ingresa tus apellidos"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sección: Identificación */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <BadgeIcon sx={{ mr: 0.75, color: "#3b82f6", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Identificación
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Tipo de Identificación
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  select
                  value={form.tipo_identificacion ?? "Cédula"}
                  onChange={(e) => setForm({ ...form, tipo_identificacion: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="Cédula">Cédula</MenuItem>
                  <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                </TextField>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Número de Identificación <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.numero_identificacion ?? ""}
                  onChange={(e) => setForm({ ...form, numero_identificacion: e.target.value })}
                  required
                  placeholder="Ingresa tu número de identificación"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sección: Información de Contacto */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <EmailIcon sx={{ mr: 0.75, color: "#3b82f6", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Información de Contacto
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Correo Electrónico
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={form.correo ?? ""}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Teléfono
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.telefono ?? ""}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="Ej: 043556677"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Celular
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.celular ?? ""}
                  onChange={(e) => setForm({ ...form, celular: e.target.value })}
                  placeholder="Ej: 0987766554"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Sección: Información Adicional */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <PublicIcon sx={{ mr: 0.75, color: "#3b82f6", fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Información Adicional
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Nacionalidad
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.nacionalidad ?? ""}
                  onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
                  placeholder="Ej: Ecuatoriana"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  Fecha de Nacimiento
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={form.fecha_nacimiento?.toString().slice(0, 10) ?? ""}
                  onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                size="small"
                sx={{ 
                  textTransform: "none", 
                  borderRadius: 1.5,
                  px: 2.5,
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  "&:hover": {
                    borderColor: "#2563eb",
                    bgcolor: "#eff6ff",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={save}
                disabled={saving}
                size="small"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: 1.5,
                  px: 3,
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                  },
                  "&:disabled": {
                    background: "#e5e7eb",
                  },
                }}
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
