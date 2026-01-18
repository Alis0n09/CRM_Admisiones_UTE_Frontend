import { useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { JSX } from "react";

export default function TestMUI(): JSX.Element {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
        <AppBar position="static">
          <Toolbar>
            <RocketLaunchIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MUI Smoke Test
            </Typography>

            <Button
              color="inherit"
              startIcon={mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
            >
              Cambiar a {mode === "dark" ? "claro" : "oscuro"}
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 4 }}>
          <Stack spacing={2}>
            <Alert severity="success">
              Si ves este Alert con estilos, MUI está funcionando ✅
            </Alert>

            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Prueba rápida
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField label="Título" fullWidth />
                <TextField label="Categoría" fullWidth />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained">Guardar</Button>
                <Button variant="outlined">Cancelar</Button>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}