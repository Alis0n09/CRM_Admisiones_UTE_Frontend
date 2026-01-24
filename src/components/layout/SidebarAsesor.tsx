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
import Home from "@mui/icons-material/Home";
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
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#1e293b",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo/Brand */}
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "white",
            "& span": { fontWeight: 400 },
          }}
        >
          <span>CRM</span> Admisiones
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <List dense sx={{ px: 1.5 }}>
          {links.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <ListItemButton
                key={to}
                component={RouterLink}
                to={to}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? "#3b82f6" : "transparent",
                  color: isActive ? "white" : "rgba(255,255,255,0.8)",
                  "&:hover": {
                    bgcolor: isActive ? "#2563eb" : "rgba(255,255,255,0.1)",
                  },
                  py: 1.25,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Bottom Links */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2 }}>
        <List dense>
          <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 2, color: "rgba(255,255,255,0.8)", py: 1.25, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}><Home /></ListItemIcon>
            <ListItemText primary="Sitio público" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: "rgba(255,255,255,0.8)", py: 1.25, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}><ExitToApp /></ListItemIcon>
            <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}
