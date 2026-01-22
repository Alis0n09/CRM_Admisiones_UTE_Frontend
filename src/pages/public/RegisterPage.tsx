import {
  Box,
  Button,
  Card,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import TopbarPublic from "../../components/TopbarPublic";
import FooterPublic from "../../components/FooterPublic";

export default function RegisterPage() {
  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopbarPublic />

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Container maxWidth="md">
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              p: 4,
            }}
          >
            {/* Título */}
            <Typography
              variant="h4"
              fontWeight={800}
              textAlign="center"
              sx={{ mb: 0.5, color: "#1e293b" }}
            >
              Crear cuenta
            </Typography>
            <Typography
              textAlign="center"
              sx={{ color: "#64748b", mb: 4 }}
            >
              Regístrate para acceder al portal de estudiantes y gestiona tu proceso de admisión
            </Typography>

            <Stack spacing={3}>
              {/* FILA 1 */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Nombres"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Apellidos"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>

              {/* FILA 2 */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Correo electrónico"
                  type="email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Usuario"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>

              {/* FILA 3 */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Confirmar contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Stack>

              {/* BOTÓN */}
              <Button
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                  },
                }}
              >
                Registrarme
              </Button>

              {/* LINKS */}
              <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <Typography fontSize={14} sx={{ color: "#64748b" }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                    sx={{
                      fontWeight: 700,
                      color: "#3b82f6",
                      "&:hover": {
                        color: "#2563eb",
                      },
                    }}
                  >
                    Inicia sesión
                  </Link>
                </Typography>

                <Link
                  component={RouterLink}
                  to="/"
                  underline="hover"
                  fontSize={14}
                  sx={{
                    fontWeight: 700,
                    color: "#3b82f6",
                    "&:hover": {
                      color: "#2563eb",
                    },
                  }}
                >
                  Volver al inicio
                </Link>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* FOOTER */}
      <FooterPublic />
    </Box>
  );
}
