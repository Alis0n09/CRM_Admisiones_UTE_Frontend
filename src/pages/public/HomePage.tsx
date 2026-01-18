import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import TopbarPublic from "../../components/TopbarPublic";
import CareerCard from "../../components/CareerCard";
import ContactForm from "../../components/ContactForm";
import FooterPublic from "../../components/FooterPublic";


const careers = [
  {
    title: "Tecnología en Desarrollo de Software",
    desc: "Programación, bases de datos, arquitectura y desarrollo web.",
    img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Tecnología en Administración de Empresas",
    desc: "Gestión, liderazgo, emprendimiento y dirección estratégica.",
    img: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Tecnología en Atención de Enfermería",
    desc: "Formación enfocada en el cuidado, atención y servicio.",
    img: "https://www.excelsior.edu/wp-content/uploads/2022/02/different-types-of-nurses.jpg",
  },
    {
    title: "Tecnología en Marketing Digital",
    desc: "Estrategia, análisis de datos, contenido y comunicación digital.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Tecnología en Asistente de Odontología",
    desc: "Apoyo técnico en procedimientos dentales y atención al paciente.",
    img: "https://portal.pucrs.br/wp-content/uploads/2024/08/odontologia_diegofurtado.jpg",
  },
];

export default function HomePage() {
  return (
    <Box>
      <TopbarPublic />

      {/* HERO */}
      <Box sx={{ bgcolor: "white", borderRadius: 2, p: 3, mb: 3, boxShadow: 1 }}>
        <Typography variant="h4" fontWeight={800}>
          <span style={{ color: "#5b5bf7" }}>—</span>{" "}
          <span style={{ color: "#0ea5e9" }}>Tu futuro</span>{" "}
          <span style={{ color: "#10b981" }}>empieza aquí</span>
        </Typography>

        <Typography sx={{ mt: 1, color: "text.secondary" }}>
          Explora carreras y becas. Déjanos tus datos y un asesor te contactará con información personalizada.
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" href="#formulario">
            Conoce más
          </Button>
          <Button variant="outlined" href="#carreras" >
            Ver carreras
          </Button>
        </Stack>
      </Box>

      {/* FRASE */}
      <Box sx={{ textAlign: "center", my: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          “La educación no cambia el mundo, cambia a las personas que van a cambiar el mundo.”
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* BECAS */}
      <Container disableGutters id="becas">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          Becas
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          Opciones de becas y beneficios. Te orientamos según tu perfil, requisitos e interés.
        </Typography>

        <Stack spacing={1} sx={{ pl: 2 }}>
          <Typography>• <b>Becas por mérito</b> — Reconocimiento al rendimiento académico.</Typography>
          <Typography>• <b>Apoyo socioeconómico</b> — Opciones de ayuda según situación y requisitos.</Typography>
          <Typography>• <b>Convenios y descuentos</b> — Beneficios por convenios institucionales.</Typography>
        </Stack>
      </Container>

      <Divider sx={{ my: 3 }} />

      {/* CARRERAS */}
      <Container disableGutters id="carreras">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
          Carreras
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 2 }}>
          Encuentra una carrera que se adapte a tus metas. Requisitos, malla y proceso con asesoría.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {careers.map((c) => (
            <CareerCard key={c.title} title={c.title} desc={c.desc} img={c.img} />
          ))}
        </Box>
      </Container>

      <Divider sx={{ my: 4 }} />

      {/* FORM */}
      <Box id="formulario">
        <ContactForm />
      </Box>

      {/* FOOTER */}
      <Box id="contacto" sx={{ mt: 4 }}>
        <FooterPublic />
      </Box>
    </Box>
  );
}
