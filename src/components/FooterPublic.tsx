import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export default function FooterPublic() {
  return (
    <Container>
      <Divider sx={{ my: 3 }} />

      <Box sx={{ py: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} justifyContent="space-between">
          <Box>
            <Typography fontWeight={800}>Ute AliVic Admisiones</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Plataforma para gestión de aspirantes, contactos, postulaciones, matrículas y becas.
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 2 }}>
              © 2026 — Proyecto académico
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={800}>Contacto</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Correo: admisiones@ute.edu.ec
              <br />
              Teléfono: +593 0983348961
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={800}>Accesos</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              Iniciar sesión
              <br />
              Formulario
              <br />
              Carreras
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
