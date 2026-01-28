import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import * as clienteService from "../../services/cliente.service";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    if (!formData.password) {
      setError("Debes ingresar una contraseña");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("¡Las contraseñas no coinciden");
      return;
    }

    if (!formData.numero_identificacion || formData.numero_identificacion.trim() === "") {
      setError("Debes ingresar tu número de identificación");
      return;
    }

    setLoading(true);
    try {
      // Crear el cliente - NO incluir 'estado' ya que el backend no lo acepta
      const clienteData = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        correo: formData.correo,
        tipo_identificacion: formData.tipo_identificacion,
        numero_identificacion: formData.numero_identificacion.trim(),
        origen: "Formulario Web",
      };

      const cliente = await clienteService.createClientePublico(clienteData);
      
      // Aquí podrías crear el usuario también si el backend lo requiere
      // Por ahora solo redirigimos al login
      alert("Gracias por registrarte, un asesor se contactará contigo muy pronto!");
      navigate("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Error al registrar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", overflow: "hidden" }}>
      {/* IZQUIERDA: Imagen con degradado */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          alignItems: "flex-start",
          justifyContent: "center",
          pt: 6,
        }}
      >
        {/* Fondo con imagen */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/registro.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.95) saturate(1.2) contrast(1.05)",
            transform: "scale(1)",
            transition: "transform 0.3s ease",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.1)",
            },
          }}
        />
        {/* Overlay degradado mejorado */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.75) 0%, rgba(99, 102, 241, 0.70) 50%, rgba(20, 184, 166, 0.68) 100%)",
            backdropFilter: "blur(0.5px)",
          }}
        />

        {/* Contenido arriba */}
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
            Regístrate para acceder a tu cuenta
          </Typography>
        </Box>
      </Box>

      {/* DERECHA: Form */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 4,
          overflow: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Logo */}
          <Box
            sx={{
              mb: 1.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: 100,
                height: 100,
                objectFit: "contain",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            sx={{ mb: 0.5, color: "#1e293b", fontSize: { xs: "1.5rem", md: "1.75rem" } }}
          >
            Regístrate
          </Typography>
          <Typography
            textAlign="center"
            sx={{ color: "#64748b", mb: 2, fontSize: "0.875rem" }}
          >
            Crea tu cuenta para gestionar tu proceso de admisión
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                name="nombres"
                label="Nombres"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.nombres}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                name="apellidos"
                label="Apellidos"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.apellidos}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                name="correo"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.correo}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Tipo de identificación</InputLabel>
                <Select
                  name="tipo_identificacion"
                  value={formData.tipo_identificacion}
                  label="Tipo de identificación"
                  onChange={handleChange}
                  required
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Cédula">Cédula</MenuItem>
                  <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                  <MenuItem value="RUC">RUC</MenuItem>
                </Select>
              </FormControl>

              <TextField
                name="numero_identificacion"
                label="Número de identificación"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.numero_identificacion}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                name="password"
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.password}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                name="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    sx={{
                      color: "#64748b",
                      "&.Mui-checked": {
                        color: "#1e293b",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: "0.875rem", color: "#64748b" }}>
                    Acepto los Términos y Condiciones
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                  },
                  "&:disabled": {
                    background: "#94a3b8",
                  },
                }}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </Stack>
          </form>

          <Stack spacing={0.5} alignItems="center" sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 14, color: "#64748b" }}>
              ¿Ya tienes una cuenta?{" "}
              <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{
                  color: "#3b82f6",
                  fontWeight: 700,
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
    </Box>
  );
}
