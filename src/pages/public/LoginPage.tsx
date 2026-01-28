import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      const r = u?.roles ?? [];
      if (r.length === 0) {
        setError(
          "Sesión iniciada, pero tu cuenta no tiene un rol asignado (ADMIN, ASESOR, ASPIRANTE). Pide al administrador que te asigne un rol en la base de datos (tabla rol_usuario)."
        );
        return;
      }
      if (r.includes("ADMIN")) navigate("/admin");
      else if (r.includes("ASESOR")) navigate("/asesor");
      else if (r.includes("ASPIRANTE")) navigate("/aspirante");
      else navigate("/");
    } catch (err: any) {
      if (!err?.response) {
        setError(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución (puerto 3000)."
        );
      } else {
        const msg = err?.response?.data?.message;
        setError(Array.isArray(msg) ? msg[0] : msg || "Credenciales incorrectas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* IZQUIERDA: Form */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            sx={{ mb: 0.5, color: "#1e293b" }}
          >
            Iniciar sesión
          </Typography>
          <Typography
            textAlign="center"
            sx={{ color: "#64748b", mb: 3 }}
          >
            Ingresa los detalles de tu cuenta para continuar
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{
                    color: "#3b82f6",
                    fontSize: 14,
                    fontWeight: 600,
                    "&:hover": {
                      color: "#2563eb",
                    },
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  py: 1.4,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                  },
                  "&:disabled": {
                    background: "#94a3b8",
                  },
                }}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </Stack>
          </form>

          <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              ¿No tienes una cuenta?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="hover"
                sx={{
                  color: "#3b82f6",
                  fontWeight: 700,
                  "&:hover": {
                    color: "#2563eb",
                  },
                }}
              >
                Regístrate
              </Link>
            </Typography>
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                color: "#3b82f6",
                fontWeight: 700,
                fontSize: 14,
                "&:hover": {
                  color: "#2563eb",
                },
              }}
            >
              Volver al inicio
            </Link>
          </Stack>
        </Box>
      </Box>

      {/* DERECHA: Imagen con degradado */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Fondo con imagen */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/login.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.9) saturate(1.1)",
          }}
        />
        {/* Overlay degradado corregido */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.85) 0%, rgba(99, 102, 241, 0.80) 50%, rgba(20, 184, 166, 0.78) 100%)",
          }}
        />

        {/* Contenido centrado */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            px: 6,
          }}
        >
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              color: "white",
              lineHeight: 1.2,
              mb: 2,
            }}
          >
            Bienvenido a
            <br />
            portal de estudiantes
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.1rem",
            }}
          >
            Inicia sesión para acceder a tu cuenta
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
