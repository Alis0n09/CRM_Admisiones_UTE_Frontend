import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Person from "@mui/icons-material/Person";
import Description from "@mui/icons-material/Description";
import Assignment from "@mui/icons-material/Assignment";
import Dashboard from "@mui/icons-material/Dashboard";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";

const base = "/aspirante";

const links = [
  { to: `${base}/solicitud`, label: "Mi Solicitud", icon: <Dashboard /> },
  { to: `${base}/formulario`, label: "Formulario", icon: <Assignment /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/perfil`, label: "Mi Perfil", icon: <Person /> },
];

export default function SidebarAspirante() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <Box sx={{ width: 260, bgcolor: "white", borderRight: "1px solid #eee", p: 2, display: "flex", flexDirection: "column" }}>
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box sx={{ mb: 1.5, display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: 150, height: 150 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
        </Box>
        <Typography fontWeight={700} sx={{ color: "#1e293b" }}>Aspirante · UTE Admisiones</Typography>
        {user?.email && <Typography variant="caption" sx={{ color: "text.secondary" }}>{user.email}</Typography>}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" sx={{ color: "text.secondary", px: 2 }}>MENÚ</Typography>
      <List dense sx={{ flex: 1 }}>
        {links.map(({ to, label, icon }) => {
          const isSelected = location.pathname === to || (to === `${base}/solicitud` && location.pathname === base);
          return (
            <ListItemButton 
              key={to} 
              component={RouterLink} 
              to={to} 
              selected={isSelected}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <List dense>
        <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><Dashboard /></ListItemIcon>
          <ListItemText primary="Sitio público" />
        </ListItemButton>
        <ListItemButton onClick={logout} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}><ExitToApp /></ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </Box>
  );
}
