import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TopbarPublic from "../../components/TopbarPublic";
import FooterPublic from "../../components/FooterPublic";
import Logo from "../../components/Logo";
import {
  School,
  Favorite,
  Handshake,
  EmojiEvents,
  Search,
  Phone,
  Email,
  LocationOn,
} from "@mui/icons-material";
import * as clienteService from "../../services/cliente.service";

const scholarships = [
  {
    icon: <School sx={{ fontSize: 36, color: "#3b82f6" }} />,
    title: "Becas por mérito",
    description: "Reconocimiento al rendimiento académico",
  },
  {
    icon: <Favorite sx={{ fontSize: 36, color: "#ef4444" }} />,
    title: "Apoyo socioeconómico",
    description: "Opciones de ayuda según situación y requisitos",
  },
  {
    icon: <Handshake sx={{ fontSize: 36, color: "#10b981" }} />,
    title: "Convenios y descuentos",
    description: "Beneficios por convenios institucionales",
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 36, color: "#f59e0b" }} />,
    title: "Apoyo por deporte",
    description: "Beneficios para deportistas destacados",
  },
];

const careers = [
  {
    title: "Tecnología en Desarrollo de Software",
    desc: "Programación, bases de datos, arquitectura y desarrollo web.",
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    instructor: "Mus Boot Sarfiobers",
  },
  {
    title: "Tecnología en Administración de Empresas",
    desc: "Gestión, liderazgo, emprendimiento y dirección estratégica.",
    img: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?q=80&w=1200&auto=format&fit=crop",
    instructor: "Mau Litine Acitnission",
  },
  {
    title: "Tecnología en Atención de Enfermería",
    desc: "Formación enfocada en el cuidado, atención y servicio.",
    img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1200&auto=format&fit=crop",
    instructor: "Ana María López",
  },
    {
    title: "Tecnología en Marketing Digital",
    desc: "Estrategia, análisis de datos, contenido y comunicación digital.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    instructor: "Carlos Rodríguez",
  },
  {
    title: "Tecnología en Asistente de Odontología",
    desc: "Apoyo técnico en procedimientos dentales y atención al paciente.",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
    instructor: "María González",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombresCompletos: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombresCompletos.trim() || !formData.correo.trim() || !formData.telefono.trim()) {
      setSnackbar({
        open: true,
        message: "Por favor completa todos los campos requeridos",
        severity: "error",
      });
      return;
    }

    // Dividir nombres completos en nombres y apellidos
    const nombresArray = formData.nombresCompletos.trim().split(" ");
    const nombres = nombresArray[0] || "";
    const apellidos = nombresArray.slice(1).join(" ") || nombresArray[0] || "";

    if (!nombres || !apellidos) {
      setSnackbar({
        open: true,
        message: "Por favor ingresa nombres y apellidos completos",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Generar un número de identificación temporal único (máximo 20 caracteres según la entidad)
      // Usar formato corto: TEMP + últimos dígitos del timestamp + número aleatorio corto
      const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 dígitos
      const numeroIdentificacionTemp = `TEMP${timestamp}${randomNum}`.slice(0, 20); // Máximo 20 caracteres
      
      // Preparar los datos del cliente según la estructura de la entidad
      // NOTA: No enviar 'estado' ya que el backend tiene un valor por defecto y puede causar error
      const clienteData: Partial<clienteService.Cliente> = {
        // Campos requeridos (nullable: false)
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        tipo_identificacion: "Cédula", // Valor por defecto, el admin/asesor puede actualizarlo
        numero_identificacion: numeroIdentificacionTemp, // Temporal único (máx 20 chars), debe ser actualizado por admin/asesor
        origen: formData.mensaje.trim() || "Formulario web - Página principal",
        // NO incluir 'estado' - el backend lo maneja con valor por defecto 'Nuevo'
        
        // Campos opcionales de contacto
        correo: formData.correo.trim() || undefined,
        telefono: formData.telefono.trim() || undefined,
        celular: formData.telefono.trim() || undefined, // Usar el mismo teléfono para celular si no se especifica
        
        // Campos opcionales que no se capturan en el formulario público
        // calle_principal, calle_secundaria, numero_casa, nacionalidad, genero, estado_civil, fecha_nacimiento
        // Estos pueden ser completados por el admin/asesor después
      };

      await clienteService.createClientePublico(clienteData);

      // Limpiar formulario
      setFormData({
        nombresCompletos: "",
        correo: "",
        telefono: "",
        mensaje: "",
      });

      setSnackbar({
        open: true,
        message: "¡Gracias! Hemos recibido tu información. Te contactaremos pronto.",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Error al enviar formulario:", error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        error?.response?.data?.error ||
        "Error al enviar el formulario. Por favor intenta nuevamente.";
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <TopbarPublic />

      {/* HERO SECTION */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: 5,
          px: 3,
          minHeight: { xs: "500px", md: "600px" },
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url(/fondo.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />
        
        {/* Overlay for better text readability */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(224, 242, 254, 0.7) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(240, 249, 255, 0.7) 100%)",
            zIndex: 1,
          }}
        />


        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
            {/* Logo - Extra Large and Centered, without text */}
            <Logo size="large" showText={false} />

            {/* Main Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.8rem" },
                color: "#1e293b",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              Tu futuro empieza aquí
        </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                color: "#64748b",
                maxWidth: "600px",
                lineHeight: 1.5,
                fontSize: "1rem",
                textAlign: "center",
                mx: "auto",
              }}
            >
              Explora carreras y becas. Déjanos tus datos y un asesor te contactará con información
              personalizada.
        </Typography>

            {/* CTA Buttons */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1, justifyContent: "center" }}>
              <Button
                variant="contained"
                size="medium"
                href="#formulario"
                sx={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                  color: "white",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                  },
                }}
              >
                Conoce más &gt;
          </Button>
              <Button
                variant="contained"
                size="medium"
                href="#carreras"
                sx={{
                  background: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
                  color: "white",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                  },
                }}
              >
                Ver carreras &gt;
          </Button>
        </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* QUOTE SECTION */}
      <Box sx={{ textAlign: "center", my: 3, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "900px",
              height: "100%",
              bgcolor: "rgba(255, 255, 255, 0.6)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              zIndex: 0,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1e293b",
              fontStyle: "italic",
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.5,
              position: "relative",
              zIndex: 1,
              p: 3,
            }}
          >
            "La educación no cambia el mundo, cambia a las personas que van a cambiar el mundo."
        </Typography>
      </Box>

        {/* BECAS SECTION */}
        <Box id="becas" sx={{ my: 4, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: -20,
              right: -20,
              height: 80,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              zIndex: 0,
            }}
          />
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, position: "relative", zIndex: 1, px: 2, py: 1.5 }}>
            <School sx={{ fontSize: 28, color: "#3b82f6" }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
          Becas
        </Typography>
          </Stack>

          <Typography sx={{ color: "#64748b", mb: 2.5, fontSize: "0.95rem", position: "relative", zIndex: 1 }}>
            Conoce los tipos de becas que tenemos disponibles, además de más opciones avanzadas.
        </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 2,
              mb: 2.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            {scholarships.map((scholarship, index) => (
              <Card
                key={index}
                sx={{
                  height: "100%",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent sx={{ p: 2, textAlign: "center" }}>
                  <Box sx={{ mb: 1.5 }}>{scholarship.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: "#1e293b", fontSize: "0.95rem" }}>
                    {scholarship.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                    {scholarship.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <Button
              variant="contained"
              size="medium"
              onClick={() => navigate("/becas")}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                color: "white",
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                },
              }}
            >
              Más información &gt;
            </Button>
          </Box>
        </Box>

        {/* FORM SECTION - Explora nuestras carreras */}
        <Box id="formulario" sx={{ my: 4, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: -20,
              right: -20,
              height: 80,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              zIndex: 0,
            }}
          />
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, position: "relative", zIndex: 1, px: 2, py: 1.5 }}>
            <Search sx={{ fontSize: 28, color: "#3b82f6" }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
              Explora nuestras carreras
            </Typography>
          </Stack>

          <Typography sx={{ color: "#64748b", mb: 2.5, fontSize: "0.95rem", position: "relative", zIndex: 1 }}>
            Déjanos tus datos y te contactaremos a la brevedad.
          </Typography>

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              p: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Nombres completos"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.nombresCompletos}
                  onChange={handleChange("nombresCompletos")}
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Correo electrónico"
                  type="email"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.correo}
                  onChange={handleChange("correo")}
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Número de teléfono"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.telefono}
                  onChange={handleChange("telefono")}
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Tu mensaje"
                  multiline
                  rows={3}
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formData.mensaje}
                  onChange={handleChange("mensaje")}
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  disabled={loading}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                    color: "white",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    alignSelf: "flex-start",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                    },
                    "&:disabled": {
                      opacity: 0.6,
                    },
                  }}
                >
                  {loading ? "Enviando..." : "Enviar mensaje >"}
                </Button>
              </Stack>
            </form>
          </Card>
        </Box>

        {/* CAREERS SECTION */}
        <Box id="carreras" sx={{ my: 4, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: -10,
              left: -20,
              right: -20,
              height: 80,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              zIndex: 0,
            }}
          />
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5, position: "relative", zIndex: 1, px: 2, py: 1.5 }}>
            <School sx={{ fontSize: 28, color: "#3b82f6" }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b" }}>
              Explora nuestras carreras
            </Typography>
          </Stack>

          <Typography sx={{ color: "#64748b", mb: 2.5, fontSize: "0.95rem", position: "relative", zIndex: 1 }}>
            Programación, bases de datos, arquitectura y desarrollo web.
        </Typography>

        <Box
          sx={{
            display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 3,
              position: "relative",
              zIndex: 1,
            }}
          >
            {careers.map((career, index) => (
              <Box key={index}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={career.img}
                    alt={career.title}
                    onError={(e) => {
                      // Fallback image if original fails to load
                      const target = e.currentTarget;
                      target.src = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1200&auto=format&fit=crop";
                    }}
                    sx={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      backgroundColor: "#e0f2fe",
                    }}
                  />
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "#1e293b", fontSize: "1.1rem" }}>
                      {career.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mb: 1.5, fontSize: "0.9rem" }}>
                      {career.desc}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: "#e0f2fe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700 }}>
                          A
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                        {career.instructor}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: "center", mt: 4, position: "relative", zIndex: 1 }}>
            <Button
              variant="contained"
              size="medium"
              onClick={() => navigate("/carreras")}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                color: "white",
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                },
              }}
            >
              Más información &gt;
            </Button>
          </Box>
        </Box>

        {/* CONTACT SECTION */}
        <Box id="contacto" sx={{ my: 4, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              top: -15,
              left: "50%",
              transform: "translateX(-50%)",
              width: "90%",
              maxWidth: 700,
              height: 100,
              bgcolor: "rgba(255, 255, 255, 0.5)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              zIndex: 0,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5, textAlign: "center", position: "relative", zIndex: 1, pt: 2 }}>
            ¿Tienes alguna pregunta?
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "#64748b", mb: 1, textAlign: "center", fontWeight: 500, position: "relative", zIndex: 1 }}
          >
            ¡Estamos aquí para ayudarte!
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 2.5, textAlign: "center", fontSize: "0.95rem", position: "relative", zIndex: 1 }}>
            Déjanos tus datos y te contactaremos a la brevedad.
          </Typography>

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              p: 3,
              maxWidth: 550,
              mx: "auto",
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Phone sx={{ color: "#3b82f6", fontSize: 20 }} />
                <Typography sx={{ color: "#1e293b", fontSize: "0.95rem" }}>+593 99 9999 999</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Email sx={{ color: "#3b82f6", fontSize: 20 }} />
                <Typography sx={{ color: "#1e293b", fontSize: "0.95rem" }}>info@alivicadmission.com</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocationOn sx={{ color: "#3b82f6", fontSize: 20 }} />
                <Typography sx={{ color: "#1e293b", fontSize: "0.95rem" }}>
                  Dirección principal en Ciudad, País.
                </Typography>
              </Stack>
              <Box sx={{ textAlign: "center", pt: 1 }}>
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
                    color: "white",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
                    },
                  }}
                >
                  Enviar mensaje &gt;
                </Button>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Container>

      {/* FOOTER */}
      <FooterPublic />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
