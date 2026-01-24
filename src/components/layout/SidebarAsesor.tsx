import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import Description from "@mui/icons-material/Description";
import Timeline from "@mui/icons-material/Timeline";
import Dashboard from "@mui/icons-material/Dashboard";
import CalendarToday from "@mui/icons-material/CalendarToday";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useAuth } from "../../context/AuthContext";

const base = "/asesor";

const links = [
  { to: base, label: "Dashboard", icon: <Dashboard /> },
  { to: `${base}/clientes`, label: "Mis Aspirantes", icon: <People /> },
  { to: `${base}/calendario`, label: "Calendario", icon: <CalendarToday /> },
  { to: `${base}/tareas`, label: "Tareas", icon: <Assignment /> },
  { to: `${base}/postulaciones`, label: "Postulaciones", icon: <School /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/seguimientos`, label: "Seguimientos", icon: <Timeline /> },
];

export default function SidebarAsesor() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const getInitials = (email?: string) => {
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "A";
  };

  return (
    <Box sx={{ width: 280, bgcolor: "#1e293b", color: "white", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Logo y título */}
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 60,
            height: 60,
            objectFit: "contain",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.src = "/logo.jpeg";
            target.onerror = () => {
              target.style.display = "none";
            };
          }}
        />
        <Typography variant="h6" fontWeight={700} sx={{ color: "white", mb: 0.5 }}>
          Sistema de Admisiones
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Asesor
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Menú */}
      <List dense sx={{ flex: 1, px: 1, py: 2 }}>
        {links.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={RouterLink}
            to={to}
            selected={location.pathname === to}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: "rgba(255, 255, 255, 0.8)",
              "&.Mui-selected": {
                bgcolor: "rgba(59, 130, 246, 0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.3)",
                },
              },
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      {/* Perfil del usuario */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: "#8b5cf6",
            width: 40,
            height: 40,
            fontSize: "0.875rem",
          }}
        >
          {getInitials(user?.email)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ color: "white", fontWeight: 500 }}>
            Asesor Usuario
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user?.email || "usuario@universidad.edu"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
