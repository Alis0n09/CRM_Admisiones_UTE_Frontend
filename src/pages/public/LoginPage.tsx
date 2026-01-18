import { Box, Button, Link, Stack, TextField, Typography, Alert } from "@mui/material";
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
        setError("Sesión iniciada, pero tu cuenta no tiene un rol asignado (ADMIN, ASESOR, ASPIRANTE). Pide al administrador que te asigne un rol en la base de datos (tabla rol_usuario).");
        return;
      }
      if (r.includes("ADMIN")) navigate("/admin");
      else if (r.includes("ASESOR")) navigate("/asesor");
      else if (r.includes("ASPIRANTE")) navigate("/aspirante");
      else navigate("/");
    } catch (err: any) {
      if (!err?.response) {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución (puerto 3000).");
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
          width: { xs: "100%", md: 460 },
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 6,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
            <Box
              component="img"
              src="/logo.jpeg"
              alt="Logo"
              sx={{ height: 300, objectFit: "contain" }}
            />
          </Box>

          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Login
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Ingresa los detalles de tu cuenta para continuar
          </Typography>

          <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Email" variant="standard" fullWidth type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Contraseña" type="password" variant="standard" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} required />

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Link component="button" type="button" underline="hover" sx={{ color: "#7c3aed", fontSize: 14 }}>
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
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#8b5cf6",
                "&:hover": { bgcolor: "#7c3aed" },
              }}
            >
                {loading ? "..." : "Iniciar sesión"}
            </Button>
          </Stack>
          </form>

          <Typography sx={{ mt: 2, fontSize: 14, color: "text.secondary" }}>
            ¿No tienes una cuenta?{" "}
            <Link component={RouterLink} to="/register" underline="hover" sx={{ color: "#7c3aed", fontWeight: 700 }}>
              Regístrate
            </Link>
          </Typography>
          <Link component={RouterLink} to="/" underline="hover" sx={{ color: "#7c3aed", fontWeight: 700, display: "block", mt: 1 }}>
            Volver al inicio
          </Link>
        </Box>
      </Box>

      {/* DERECHA: Imagen */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "block" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fondo */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/login.jpeg)",
            backgroundSize: "120%",
            backgroundPosition: "center",
            filter: "saturate(1.1)",
          }}
        />
        {/* Overlay degradado como tu imagen */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(129, 36, 114, 0.83), rgba(111, 64, 223, 0.8), rgba(31, 184, 133, 0.78))",
          }}
        />

        {/* Texto */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            p: 8,
          }}
        >
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ color: "white", lineHeight: 1.05 }}>
              Bienvenido a
              <br />
              portal de estudiantes
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.8)", mt: 2 }}>
              Inicia sesión para acceder a tu cuenta
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
