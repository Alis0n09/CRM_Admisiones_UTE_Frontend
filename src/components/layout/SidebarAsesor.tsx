import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import Folder from "@mui/icons-material/Folder";
import Description from "@mui/icons-material/Description";
import Timeline from "@mui/icons-material/Timeline";
import Dashboard from "@mui/icons-material/Dashboard";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useAuth } from "../../context/AuthContext";

const base = "/asesor";

const links = [
  { to: base, label: "Dashboard", icon: <Dashboard /> },
  { to: `${base}/clientes`, label: "Clientes", icon: <People /> },
  { to: `${base}/tareas`, label: "Mis tareas", icon: <Assignment /> },
  { to: `${base}/postulaciones`, label: "Postulaciones", icon: <School /> },
  { to: `${base}/carreras`, label: "Carreras", icon: <Folder /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/seguimientos`, label: "Seguimientos", icon: <Timeline /> },
];

export default function SidebarAsesor() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <Box sx={{ width: 260, bgcolor: "white", borderRight: "1px solid #eee", p: 2, display: "flex", flexDirection: "column" }}>
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box component="img" src="/logo.jpeg" alt="Logo" sx={{ width: 120, height: 120, objectFit: "contain", mb: 1 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
        <Typography fontWeight={700}>Asesor · UTE Admisiones</Typography>
        {user?.email && <Typography variant="caption" sx={{ color: "text.secondary" }}>{user.email}</Typography>}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" sx={{ color: "text.secondary", px: 2 }}>MENÚ</Typography>
      <List dense sx={{ flex: 1 }}>
        {links.map(({ to, label, icon }) => (
          <ListItemButton key={to} component={RouterLink} to={to} selected={location.pathname === to} sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List dense>
        <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 1 }}><ListItemIcon sx={{ minWidth: 36 }}><Dashboard /></ListItemIcon><ListItemText primary="Sitio público" /></ListItemButton>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1 }}><ListItemIcon sx={{ minWidth: 36 }}><ExitToApp /></ListItemIcon><ListItemText primary="Cerrar sesión" /></ListItemButton>
      </List>
    </Box>
  );
}
