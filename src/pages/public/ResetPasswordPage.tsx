import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import * as authService from "../../services/auth.service";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noToken, setNoToken] = useState(false);

  useEffect(() => {
    if (!token.trim()) setNoToken(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      if (!err?.response) {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.");
      } else {
        const msg = err?.response?.data?.message;
        setError(
          Array.isArray(msg) ? msg[0] : msg || "El enlace ha expirado o no es válido. Solicita uno nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (noToken) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Box sx={{ maxWidth: 400, textAlign: "center" }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: "#1e293b" }}>
            Enlace inválido
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 3 }}>
            Para restablecer tu contraseña necesitas un enlace válido. Solicítalo desde la página de olvidé mi contraseña.
          </Typography>
          <Stack spacing={1} alignItems="center">
            <Button
              component={RouterLink}
              to="/forgot-password"
              variant="contained"
              sx={{
                borderRadius: 2,
                py: 1.2,
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)" },
              }}
            >
              Solicitar enlace
            </Button>
            <Link component={RouterLink} to="/login" underline="hover" sx={{ color: "#3b82f6", fontWeight: 600 }}>
              Volver a iniciar sesión
            </Link>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
        <Box sx={{ maxWidth: 400, textAlign: "center" }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Contraseña actualizada. Redirigiendo al inicio de sesión...
          </Alert>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            sx={{
              borderRadius: 2,
              py: 1.2,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
              "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)" },
            }}
          >
            Ir a iniciar sesión
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
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
          <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 0.5, color: "#1e293b" }}>
            Nueva contraseña
          </Typography>
          <Typography textAlign="center" sx={{ color: "#64748b", mb: 3 }}>
            Elige una contraseña segura de al menos 6 caracteres
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Nueva contraseña"
                type="password"
                variant="outlined"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                size="small"
                helperText="Mínimo 6 caracteres"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
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
                  "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)" },
                  "&:disabled": { background: "#94a3b8" },
                }}
              >
                {loading ? "Guardando..." : "Cambiar contraseña"}
              </Button>
            </Stack>
          </form>

          <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, "&:hover": { color: "#2563eb" } }}
            >
              Solicitar nuevo enlace
            </Link>
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, "&:hover": { color: "#2563eb" } }}
            >
              Volver a iniciar sesión
            </Link>
          </Stack>
        </Box>
      </Box>

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
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.85) 0%, rgba(99, 102, 241, 0.80) 50%, rgba(20, 184, 166, 0.78) 100%)",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 6 }}>
          <Typography variant="h3" fontWeight={900} sx={{ color: "white", lineHeight: 1.2, mb: 2 }}>
            Casi listo
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem" }}>
            Elige una contraseña segura para tu cuenta
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
