import {
  Box,
  Container,
  Stack,
  Typography,
  Grid,
  IconButton,
  Link,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
} from "@mui/icons-material";
import Logo from "./Logo";

export default function FooterPublic() {
  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        color: "white",
        py: 6,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left Side - Logo and Brand */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ filter: "brightness(1.1)" }}>
                <Logo size="small" showText={true} />
              </Box>
              <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1, textAlign: "center" }}>
                Universidad UTE
              </Typography>
            </Stack>
          </Grid>

          {/* Navigation Links */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={4}>
              {/* Becas Column */}
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                  Becas
                </Typography>
                <Stack spacing={1}>
                  <Link href="#becas" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Becas por mérito
                  </Link>
                  <Link href="#becas" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Apoyo socioeconómico
                  </Link>
                  <Link href="#becas" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Convenios y descuentos
                  </Link>
                </Stack>
              </Grid>

              {/* Carreras Column */}
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                  Carreras
                </Typography>
                <Stack spacing={1}>
                  <Link href="#carreras" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Desarrollo de Software
                  </Link>
                  <Link href="#carreras" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Administración
                  </Link>
                  <Link href="#carreras" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Empresas
                  </Link>
                </Stack>
              </Grid>

              {/* Información Column */}
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "white" }}>
                  Información
                </Typography>
                <Stack spacing={1}>
                  <Link href="#formulario" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Solicitar información
                  </Link>
                  <Link href="#contacto" sx={{ color: "#cbd5e1", textDecoration: "none", "&:hover": { color: "white" } }}>
                    Contacto
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Side - Social Media */}
          <Grid item xs={12} md={2}>
            <Stack spacing={2} alignItems={{ xs: "flex-start", md: "flex-end" }}>
              <Stack direction="row" spacing={1}>
                <IconButton
                  sx={{
                    color: "#cbd5e1",
                    "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  sx={{
                    color: "#cbd5e1",
                    "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  sx={{
                    color: "#cbd5e1",
                    "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Instagram />
                </IconButton>
                <IconButton
                  sx={{
                    color: "#cbd5e1",
                    "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <YouTube />
                </IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid #334155", textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            © 2024 AliVic Admission. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
