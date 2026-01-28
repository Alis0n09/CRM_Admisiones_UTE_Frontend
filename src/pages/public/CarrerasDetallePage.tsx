import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import TopbarPublic from "../../components/TopbarPublic";
import FooterPublic from "../../components/FooterPublic";
import {
  School,
  CheckCircle,
  ArrowBack,
  AccessTime,
  People,
  TrendingUp,
  Book,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const carrerasDetalle = [
  {
    title: "Tecnología en Desarrollo de Software",
    desc: "Programación, bases de datos, arquitectura y desarrollo web.",
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    duracion: "4 semestres",
    nivel: "Tecnología Superior",
    informacion: [
      "Formación integral en desarrollo de software y aplicaciones web",
      "Aprendizaje de lenguajes de programación modernos (JavaScript, Python, Java)",
      "Desarrollo de aplicaciones móviles y web responsivas",
      "Gestión de bases de datos y arquitectura de software",
      "Metodologías ágiles y trabajo en equipo",
      "Proyectos prácticos y portafolio profesional",
    ],
    perfil: [
      "Interés por la tecnología y la programación",
      "Capacidad de resolución de problemas lógicos",
      "Trabajo en equipo y comunicación efectiva",
      "Creatividad e innovación en soluciones tecnológicas",
      "Disposición para el aprendizaje continuo",
    ],
    campoLaboral: [
      "Desarrollador de software en empresas tecnológicas",
      "Desarrollador web frontend y backend",
      "Desarrollador de aplicaciones móviles",
      "Arquitecto de software",
      "Consultor en tecnologías de la información",
      "Emprendedor tecnológico",
    ],
  },
  {
    title: "Tecnología en Administración de Empresas",
    desc: "Gestión, liderazgo, emprendimiento y dirección estratégica.",
    img: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?q=80&w=1200&auto=format&fit=crop",
    color: "#10b981",
    bgColor: "#d1fae5",
    duracion: "4 semestres",
    nivel: "Tecnología Superior",
    informacion: [
      "Formación en gestión empresarial y administración estratégica",
      "Desarrollo de habilidades de liderazgo y toma de decisiones",
      "Planificación financiera y gestión de recursos",
      "Marketing y estrategias de mercado",
      "Emprendimiento e innovación empresarial",
      "Gestión de recursos humanos y equipos de trabajo",
    ],
    perfil: [
      "Interés por la gestión y administración empresarial",
      "Habilidades de liderazgo y comunicación",
      "Capacidad de análisis y pensamiento estratégico",
      "Orientación a resultados y trabajo en equipo",
      "Visión emprendedora e innovadora",
    ],
    campoLaboral: [
      "Administrador de empresas en diversos sectores",
      "Gerente de proyectos y operaciones",
      "Consultor empresarial",
      "Emprendedor y creador de negocios",
      "Analista de mercado y estrategia",
      "Coordinador de áreas funcionales",
    ],
  },
  {
    title: "Tecnología en Atención de Enfermería",
    desc: "Formación enfocada en el cuidado, atención y servicio.",
    img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1200&auto=format&fit=crop",
    color: "#ef4444",
    bgColor: "#fee2e2",
    duracion: "4 semestres",
    nivel: "Tecnología Superior",
    informacion: [
      "Formación integral en cuidados de enfermería y atención al paciente",
      "Aplicación de técnicas y procedimientos de enfermería",
      "Gestión de servicios de salud y atención primaria",
      "Promoción de la salud y prevención de enfermedades",
      "Ética profesional y valores humanitarios",
      "Prácticas clínicas en centros de salud",
    ],
    perfil: [
      "Vocación de servicio y cuidado hacia las personas",
      "Empatía y sensibilidad humana",
      "Capacidad de trabajo bajo presión",
      "Responsabilidad y ética profesional",
      "Habilidades de comunicación y trabajo en equipo",
    ],
    campoLaboral: [
      "Enfermero/a en hospitales y clínicas",
      "Atención primaria en centros de salud",
      "Enfermería comunitaria y domiciliaria",
      "Coordinador de servicios de enfermería",
      "Educador en salud y prevención",
      "Investigación en ciencias de la salud",
    ],
  },
  {
    title: "Tecnología en Marketing Digital",
    desc: "Estrategia, análisis de datos, contenido y comunicación digital.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    duracion: "4 semestres",
    nivel: "Tecnología Superior",
    informacion: [
      "Estrategias de marketing digital y comunicación en línea",
      "Gestión de redes sociales y community management",
      "Publicidad digital y campañas online",
      "Análisis de datos y métricas de marketing",
      "SEO, SEM y posicionamiento web",
      "Content marketing y creación de contenido",
    ],
    perfil: [
      "Creatividad e innovación en comunicación",
      "Interés por las tendencias digitales",
      "Habilidades analíticas y de interpretación de datos",
      "Comunicación efectiva y storytelling",
      "Orientación a resultados y métricas",
    ],
    campoLaboral: [
      "Especialista en marketing digital",
      "Community manager y gestor de redes sociales",
      "Analista de marketing y datos",
      "Consultor en estrategias digitales",
      "Content creator y gestor de contenido",
      "Emprendedor en negocios digitales",
    ],
  },
  {
    title: "Tecnología en Asistente de Odontología",
    desc: "Apoyo técnico en procedimientos dentales y atención al paciente.",
    img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=1200&auto=format&fit=crop",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    duracion: "4 semestres",
    nivel: "Tecnología Superior",
    informacion: [
      "Asistencia en procedimientos odontológicos y tratamientos",
      "Gestión de consultorios y atención al paciente",
      "Preparación de materiales y equipos dentales",
      "Técnicas de esterilización y control de infecciones",
      "Radiología dental y toma de radiografías",
      "Prácticas clínicas supervisadas",
    ],
    perfil: [
      "Interés por la salud bucal y atención al paciente",
      "Habilidades manuales y destreza",
      "Responsabilidad y atención al detalle",
      "Capacidad de trabajo en equipo con odontólogos",
      "Empatía y comunicación con pacientes",
    ],
    campoLaboral: [
      "Asistente dental en consultorios privados",
      "Auxiliar en clínicas odontológicas",
      "Técnico en laboratorios dentales",
      "Coordinador de consultorios dentales",
      "Asistente en servicios de salud pública",
      "Educador en salud bucal",
    ],
  },
];

export default function CarrerasDetallePage() {
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
              Información de Carreras
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", fontSize: "1.1rem", maxWidth: "800px" }}
          >
            Conoce en detalle nuestras carreras tecnológicas, su plan de
            estudios, perfil del egresado y campo laboral. Encuentra la carrera
            que mejor se adapte a tus intereses y objetivos profesionales.
          </Typography>
        </Box>

        {/* Carreras Cards */}
        <Stack spacing={4}>
          {carrerasDetalle.map((carrera, index) => (
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
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "300px 1fr",
                  },
                  gap: 0,
                }}
              >
                {/* Imagen */}
                <Box
                  component="img"
                  src={carrera.img}
                  alt={carrera.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src =
                      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1200&auto=format&fit=crop";
                  }}
                  sx={{
                    width: "100%",
                    height: { xs: 200, md: "100%" },
                    minHeight: { md: 400 },
                    objectFit: "cover",
                    backgroundColor: "#e0f2fe",
                  }}
                />

                {/* Contenido */}
                <Box>
                  <Box
                    sx={{
                      bgcolor: carrera.bgColor,
                      p: 3,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <School sx={{ fontSize: 32, color: carrera.color }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}
                        >
                          {carrera.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontSize: "0.95rem" }}
                        >
                          {carrera.desc}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      sx={{ gap: 1 }}
                    >
                      <Chip
                        icon={<AccessTime sx={{ fontSize: 16 }} />}
                        label={carrera.duracion}
                        sx={{
                          bgcolor: carrera.color,
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        icon={<Book sx={{ fontSize: 16 }} />}
                        label={carrera.nivel}
                        sx={{
                          bgcolor: carrera.color,
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
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
                          <Book sx={{ color: carrera.color, fontSize: 24 }} />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#1e293b" }}
                          >
                            Información del Programa
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5}>
                          {carrera.informacion.map((info, idx) => (
                            <Stack
                              key={idx}
                              direction="row"
                              spacing={1.5}
                              alignItems="flex-start"
                            >
                              <CheckCircle
                                sx={{
                                  color: carrera.color,
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

                      {/* Perfil y Campo Laboral */}
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <TrendingUp sx={{ color: carrera.color, fontSize: 24 }} />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#1e293b" }}
                          >
                            Perfil del Egresado
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                          {carrera.perfil.map((perfil, idx) => (
                            <Stack
                              key={idx}
                              direction="row"
                              spacing={1.5}
                              alignItems="flex-start"
                            >
                              <CheckCircle
                                sx={{
                                  color: carrera.color,
                                  fontSize: 20,
                                  mt: 0.5,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "#475569", lineHeight: 1.6 }}
                              >
                                {perfil}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mb: 2 }}
                        >
                          <People sx={{ color: carrera.color, fontSize: 24 }} />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#1e293b" }}
                          >
                            Campo Laboral
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5}>
                          {carrera.campoLaboral.map((campo, idx) => (
                            <Stack
                              key={idx}
                              direction="row"
                              spacing={1.5}
                              alignItems="flex-start"
                            >
                              <CheckCircle
                                sx={{
                                  color: carrera.color,
                                  fontSize: 20,
                                  mt: 0.5,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "#475569", lineHeight: 1.6 }}
                              >
                                {campo}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  </CardContent>
                </Box>
              </Box>
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
            ¿Listo para comenzar tu carrera profesional?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "rgba(255,255,255,0.9)",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Déjanos tus datos y un asesor te contactará para brindarte más
            información sobre el proceso de admisión y resolver todas tus
            dudas.
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
            Solicitar información &gt;
          </Button>
        </Box>
      </Container>

      <FooterPublic />
    </Box>
  );
}
