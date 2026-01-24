import { Box, IconButton, InputBase, Paper, Typography, Badge } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function TopbarAsesor() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirigir a la página de aspirantes con el término de búsqueda
      navigate(`/asesor/clientes?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #eee",
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Barra de búsqueda */}
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{
          p: "4px 12px",
          display: "flex",
          alignItems: "center",
          flex: 1,
          maxWidth: 400,
          boxShadow: "none",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
        <InputBase
          placeholder="Buscar aspirantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
          inputProps={{ "aria-label": "buscar" }}
        />
      </Paper>

      {/* Espaciador */}
      <Box sx={{ flex: 1 }} />

      {/* Enlace Inicio y Notificaciones alineados a la derecha */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          component={RouterLink}
          to="/asesor"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "text.primary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <HomeIcon />
          <Typography variant="body2">Inicio</Typography>
        </Box>

        {/* Notificaciones */}
        <IconButton sx={{ position: "relative" }}>
          <Badge badgeContent={1} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>
    </Box>
  );
}
