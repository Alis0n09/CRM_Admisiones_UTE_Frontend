import { AppBar, Button, Stack, Toolbar, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import Logo from "./Logo";

export default function TopbarPublic() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "black",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1.5 }}>
        {/* Logo - Horizontal layout */}
        <Box component="a" href="/" sx={{ textDecoration: "none" }}>
          <Logo size="small" showText={true} horizontal={true} />
        </Box>

        {/* Navigation Menu */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            flex: 1,
            justifyContent: "center",
            mx: 4,
            display: { xs: "none", md: "flex" },
          }}
        >
          <Button
            component="a"
            href="#becas"
            sx={{
              color: "#64748b",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#3b82f6", bgcolor: "transparent" },
            }}
          >
            Becas
          </Button>
          <Button
            component="a"
            href="#carreras"
            sx={{
              color: "#64748b",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#3b82f6", bgcolor: "transparent" },
            }}
          >
            Carreras
          </Button>
          <Button
            component="a"
            href="#formulario"
            sx={{
              color: "#64748b",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#3b82f6", bgcolor: "transparent" },
            }}
          >
            Información
          </Button>
          <Button
            component="a"
            href="#contacto"
            sx={{
              color: "#64748b",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#3b82f6", bgcolor: "transparent" },
            }}
          >
            Contacto
          </Button>
        </Stack>

        {/* Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            sx={{ borderRadius: 2, display: { xs: "none", sm: "inline-flex" } }}
          >
            Iniciar sesión
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
              borderRadius: 2,
              fontSize: { xs: "0.85rem", sm: "1rem" },
              px: { xs: 1.5, sm: 2 },
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb 0%, #059669 100%)",
              },
            }}
          >
            Registrarse
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
