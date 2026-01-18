import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function RegisterPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #cbb8e7, #8b5cf6, #aaf3db)",
        px: 2,
      }}
    >
      {/* CARD PRINCIPAL */}
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 1000,          // 👉 ancho cómodo
          borderRadius: 3,
          p: { xs: 3, md: 5 },    // padding responsive
        }}
      >
        {/* LOGO */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box
            component="img"
            src="/logo.jpeg"
            alt="Logo"
            sx={{
              height: 200,        // 👉 logo grande
              objectFit: "contain",
            }}
          />
        </Box>

        {/* TÍTULO */}
        <Typography
          variant="h4"
          fontWeight={800}
          textAlign="center"
          sx={{ mb: 0.5 }}
        >
          Crear cuenta
        </Typography>
        <Typography
          textAlign="center"
          sx={{ color: "text.secondary", mb: 4 }}
        >
          Regístrate para acceder al portal de estudiantes
        </Typography>

        {/* FORMULARIO */}
        <Stack spacing={3}>
          {/* FILA 1 */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Nombres" fullWidth />
            <TextField label="Apellidos" fullWidth />
          </Stack>

          {/* FILA 2 */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Correo" type="email" fullWidth />
            <TextField label="Usuario" fullWidth />
          </Stack>

          {/* FILA 3 */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Contraseña" type="password" fullWidth />
            <TextField
              label="Confirmar contraseña"
              type="password"
              fullWidth
            />
          </Stack>

          {/* BOTÓN */}
          <Button
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              py: 1.4,
              borderRadius: 2,
              fontWeight: 800,
              textTransform: "none",
              background:
                "#7c3aed",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #6d28d9, #16a34a)",
              },
            }}
          >
            Registrarme
          </Button>

          {/* LINKS */}
          <Stack spacing={1} alignItems="center">
            <Typography fontSize={14}>
              ¿Ya tienes cuenta?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{ fontWeight: 700 }}
              >
                Inicia sesión
              </Link>
            </Typography>

            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              fontSize={14}
              sx={{ fontWeight: 700 }}
            >
              Volver al inicio
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
