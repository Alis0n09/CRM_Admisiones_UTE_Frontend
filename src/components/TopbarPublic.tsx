import { AppBar, Button, Stack, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function TopbarPublic() {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: "transparent", color: "black", mb: 2 }}>
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={1}>
          <Button component={RouterLink} to="/login" variant="outlined">
            Iniciar sesión
          </Button>
          <Button component={RouterLink} to="/register" variant="contained">
            Registrarse
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
