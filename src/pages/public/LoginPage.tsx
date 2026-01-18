import { Box, Button, Link, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function LoginPage() {
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

          <Stack spacing={2}>
            <TextField label="Username" variant="standard" fullWidth />
            <TextField label="Password" type="password" variant="standard" fullWidth />

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Link component="button" underline="hover" sx={{ color: "#7c3aed", fontSize: 14 }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              variant="contained"
              size="large"
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
                Iniciar sesión
            </Button>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
              ¿No tienes una cuenta?{" "}
              <Link component={RouterLink} to="/register" underline="hover" sx={{ color: "#7c3aed", fontWeight: 700 }}>
                Regístrate
              </Link>
            </Typography>

            <Link component={RouterLink} to="/" underline="hover" sx={{ color: "#7c3aed", fontWeight: 700 }}>
              Volver al inicio
            </Link>
          </Stack>
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
