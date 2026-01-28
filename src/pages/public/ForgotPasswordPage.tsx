import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import * as authService from "../../services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setDevResetUrl(null);
    if (!email?.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(email.trim());
      setSuccess(true);
      if (res?.devMode && res?.resetUrl) setDevResetUrl(res.resetUrl);
    } catch (err: any) {
      if (!err?.response) {
        setError(
          "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución."
        );
      } else {
        const msg = err?.response?.data?.message;
        setError(
          Array.isArray(msg) ? msg[0] : msg || "Error al solicitar el restablecimiento. Intenta nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            sx={{ mb: 0.5, color: "#1e293b" }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography
            textAlign="center"
            sx={{ color: "#64748b", mb: 3 }}
          >
            Ingresa el mismo correo con el que te registraste. Te enviaremos un enlace para restablecerla.
          </Typography>

          {success ? (
            <Stack spacing={2}>
              <Alert severity="success">
                Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
                Revisa tu bandeja de entrada y la carpeta de <strong>spam</strong> en los próximos minutos.
              </Alert>
              {devResetUrl && (
                <Alert severity="info">
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    Modo desarrollo (correo no configurado)
                  </Typography>
                  <Link href={devResetUrl} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                    Usa este enlace para restablecer la contraseña
                  </Link>
                </Alert>
              )}
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)" },
                }}
              >
                Volver a iniciar sesión
              </Button>
            </Stack>
          ) : (
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
                  {loading ? "Enviando..." : "Enviar instrucciones"}
                </Button>
              </Stack>
            </form>
          )}

          <Stack spacing={1} alignItems="center" sx={{ mt: 3 }}>
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{
                color: "#3b82f6",
                fontWeight: 700,
                fontSize: 14,
                "&:hover": { color: "#2563eb" },
              }}
            >
              Volver a iniciar sesión
            </Link>
            <Link
              component={RouterLink}
              to="/"
              underline="hover"
              sx={{
                color: "#3b82f6",
                fontWeight: 700,
                fontSize: 14,
                "&:hover": { color: "#2563eb" },
              }}
            >
              Volver al inicio
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
            Recupera tu acceso
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem" }}>
            Te ayudamos a restablecer tu contraseña de forma segura
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
