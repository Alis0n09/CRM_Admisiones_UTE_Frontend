import { Button, Container, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export default function ContactForm() {
  return (
    <Container>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Déjanos tus datos
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Completa este formulario y un asesor te contactará con información según tu interés.
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Nombre" placeholder="Tus nombres" fullWidth />
            <TextField label="Apellido" placeholder="Tus apellidos" fullWidth />
            <TextField label="Correo" placeholder="ejemplo@gmail.com" fullWidth />
          </Stack>
                
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField select label="Carrera de interés" fullWidth>
            <MenuItem value="software">
            Tecnología en Desarrollo de Software
            </MenuItem>
            <MenuItem value="administracion">
            Tecnología en Administración de Empresas
            </MenuItem>
            <MenuItem value="enfermeria">
            Tecnología en Atención de Enfermería
            </MenuItem>
            <MenuItem value="marketing">
            Tecnología en Marketing Digital
            </MenuItem>
            <MenuItem value="odontologia">
            Tecnología en Asistente de Odontología
            </MenuItem>
        </TextField>
        </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Teléfono" placeholder="Ej: 09XXXXXXXX" fullWidth />
            <TextField label="Número de identificación" placeholder="Tu número de identificación" fullWidth />
          </Stack>


          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" sx={{background: "blue", "&:hover": {background: "linear-gradient(135deg, #5b21b6, #7c3aed, #22c55e)"}}}>Enviar información</Button>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              *Luego conectamos este formulario al backend.
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Recuerda que estas entregando tus datos a Ute AliVic, en base a la Ley de protección de datos personales.
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
