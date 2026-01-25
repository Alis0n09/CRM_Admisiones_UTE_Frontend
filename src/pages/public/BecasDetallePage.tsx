import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import TopbarPublic from "../../components/TopbarPublic";
import FooterPublic from "../../components/FooterPublic";
import {
  School,
  Favorite,
  Handshake,
  EmojiEvents,
  Science,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const becasDetalle = [
  {
    icon: <School sx={{ fontSize: 40, color: "#3b82f6" }} />,
    title: "Becas por mérito",
    description: "Reconocimiento al rendimiento académico",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    informacion: [
      "Reconocimiento a estudiantes con excelente rendimiento académico",
      "Descuentos que pueden llegar hasta el 50% del valor de la matrícula",
      "Válidas durante toda la carrera mientras se mantenga el promedio requerido",
      "Evaluación semestral del rendimiento académico",
    ],
    requisitos: [
      "Promedio académico mínimo de 8.5/10 en estudios previos",
      "Carta de recomendación de docente o institución educativa",
      "Copia de calificaciones o certificado de notas",
      "Ensayo personal sobre metas académicas y profesionales",
      "No tener sanciones disciplinarias",
      "Completar formulario de solicitud de beca",
    ],
    porcentaje: "Hasta 50%",
  },
  {
    icon: <Favorite sx={{ fontSize: 40, color: "#ef4444" }} />,
    title: "Apoyo socioeconómico",
    description: "Opciones de ayuda según situación y requisitos",
    color: "#ef4444",
    bgColor: "#fee2e2",
    informacion: [
      "Programa diseñado para estudiantes con necesidades económicas",
      "Cobertura parcial o total según evaluación socioeconómica",
      "Incluye apoyo para materiales educativos y transporte",
      "Renovación anual basada en situación económica y rendimiento académico",
    ],
    requisitos: [
      "Comprobante de ingresos familiares (últimos 3 meses)",
      "Documentación que acredite situación económica (certificado de ingresos, declaración de renta)",
      "Carta de solicitud explicando la situación económica",
      "Promedio académico mínimo de 7.0/10",
      "No tener otras becas o ayudas económicas simultáneas",
      "Entrevista con el comité de becas",
      "Documentos de identidad de todos los miembros del hogar",
    ],
    porcentaje: "Hasta 100%",
  },
  {
    icon: <Handshake sx={{ fontSize: 40, color: "#10b981" }} />,
    title: "Convenios y descuentos",
    description: "Beneficios por convenios institucionales",
    color: "#10b981",
    bgColor: "#d1fae5",
    informacion: [
      "Descuentos especiales para empleados de empresas e instituciones aliadas",
      "Beneficios familiares para hijos de empleados de empresas convenio",
      "Descuentos por pago anticipado o contado",
      "Programas de financiamiento flexible",
    ],
    requisitos: [
      "Carta de empleo o certificado laboral de la empresa convenio",
      "Verificación del convenio activo con la institución",
      "Documentación que acredite el parentesco (para beneficios familiares)",
      "Cumplir con los requisitos académicos de admisión",
      "Presentar documentación de la empresa o institución aliada",
      "Aplicar dentro del período establecido en el convenio",
    ],
    porcentaje: "10% - 30%",
  },
  {
    icon: <EmojiEvents sx={{ fontSize: 40, color: "#f59e0b" }} />,
    title: "Apoyo por deporte",
    description: "Beneficios para deportistas destacados",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    informacion: [
      "Reconocimiento a deportistas de alto rendimiento",
      "Apoyo para estudiantes que representan a la institución en competencias",
      "Flexibilidad en horarios para entrenamientos y competencias",
      "Acceso a instalaciones deportivas y programas de entrenamiento",
    ],
    requisitos: [
      "Certificado de participación en competencias deportivas (nacionales o internacionales)",
      "Carta de recomendación del entrenador o club deportivo",
      "Promedio académico mínimo de 7.5/10",
      "Compromiso de representar a la institución en competencias",
      "Certificado médico de aptitud deportiva",
      "Fotografías o videos de participación en competencias",
      "Cumplir con los requisitos de admisión académica",
    ],
    porcentaje: "Hasta 40%",
  },
  {
    icon: <Science sx={{ fontSize: 40, color: "#a855f7" }} />,
    title: "Beca STEAM para mujeres",
    description: "Apoyo para mujeres en ciencia, tecnología e ingeniería",
    color: "#a855f7",
    bgColor: "#f3e8ff",
    informacion: [
      "Programa diseñado para promover la participación de mujeres en áreas STEAM",
      "Descuentos especiales para mujeres que estudien carreras de ciencia, tecnología, ingeniería, artes o matemáticas",
      "Mentoría y acompañamiento durante toda la carrera",
      "Acceso a programas de desarrollo profesional y networking",
      "Apoyo para proyectos de investigación y emprendimiento",
    ],
    requisitos: [
      "Ser mujer y estar inscrita o postularse a una carrera STEAM",
      "Promedio académico mínimo de 7.5/10 en estudios previos",
      "Carta de motivación explicando interés en áreas STEAM",
      "Carta de recomendación (opcional pero valorada)",
      "Compromiso de participar en actividades del programa STEAM",
      "Cumplir con los requisitos de admisión académica",
    ],
    porcentaje: "Hasta 50%",
  },
];

export default function BecasDetallePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <TopbarPublic />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              mb: 2,
              color: "#64748b",
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Volver al inicio
          </Button>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <School sx={{ fontSize: 40, color: "#3b82f6" }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b" }}>
              Información de Becas
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", fontSize: "1.1rem", maxWidth: "800px" }}
          >
            Conoce en detalle los tipos de becas disponibles, sus requisitos y
            beneficios. Encuentra la opción que mejor se adapte a tu perfil y
            situación.
          </Typography>
        </Box>

        {/* Becas Cards */}
        <Stack spacing={4}>
          {becasDetalle.map((beca, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: beca.bgColor,
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {beca.icon}
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#1e293b" }}
                    >
                      {beca.title}
                    </Typography>
                    <Chip
                      label={beca.porcentaje}
                      sx={{
                        bgcolor: beca.color,
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="body1"
                    sx={{ color: "#64748b", fontSize: "1rem" }}
                  >
                    {beca.description}
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                    },
                    gap: 4,
                  }}
                >
                  {/* Información */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <School sx={{ color: beca.color, fontSize: 24 }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#1e293b" }}
                      >
                        Información
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {beca.informacion.map((info, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          <CheckCircle
                            sx={{
                              color: beca.color,
                              fontSize: 20,
                              mt: 0.5,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#475569", lineHeight: 1.6 }}
                          >
                            {info}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  {/* Requisitos */}
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <CheckCircle sx={{ color: beca.color, fontSize: 24 }} />
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#1e293b" }}
                      >
                        Requisitos
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {beca.requisitos.map((req, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          <CheckCircle
                            sx={{
                              color: beca.color,
                              fontSize: 20,
                              mt: 0.5,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "#475569", lineHeight: 1.6 }}
                          >
                            {req}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* CTA Section */}
        <Box
          sx={{
            mt: 6,
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
            textAlign: "center",
            color: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 2, color: "white" }}
          >
            ¿Tienes preguntas sobre las becas?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: "rgba(255,255,255,0.9)", maxWidth: "600px", mx: "auto" }}
          >
            Nuestro equipo está listo para ayudarte. Contáctanos para más
            información sobre el proceso de aplicación y requisitos específicos.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/#formulario")}
            sx={{
              bgcolor: "white",
              color: "#3b82f6",
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            Contactar ahora &gt;
          </Button>
        </Box>
      </Container>

      <FooterPublic />
    </Box>
  );
}
