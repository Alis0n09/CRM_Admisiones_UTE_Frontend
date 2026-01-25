import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Stack } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import People from "@mui/icons-material/People";
import Badge from "@mui/icons-material/Badge";
import Person from "@mui/icons-material/Person";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import Folder from "@mui/icons-material/Folder";
import Description from "@mui/icons-material/Description";
import CardGiftcard from "@mui/icons-material/CardGiftcard";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Timeline from "@mui/icons-material/Timeline";
import Dashboard from "@mui/icons-material/Dashboard";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Home from "@mui/icons-material/Home";
import { useAuth } from "../../context/AuthContext";

const base = "/admin";

const links = [
  { to: base, label: "Dashboard", icon: <Dashboard /> },
  { to: `${base}/clientes`, label: "Clientes", icon: <People /> },
  { to: `${base}/empleados`, label: "Empleados", icon: <Badge /> },
  { to: `${base}/usuarios`, label: "Usuarios", icon: <Person /> },
  { to: `${base}/tareas`, label: "Tareas", icon: <Assignment /> },
  { to: `${base}/postulaciones`, label: "Postulaciones", icon: <School /> },
  { to: `${base}/carreras`, label: "Carreras", icon: <Folder /> },
  { to: `${base}/matriculas`, label: "Matrículas", icon: <School /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/becas`, label: "Becas", icon: <CardGiftcard /> },
  { to: `${base}/roles`, label: "Roles", icon: <AdminPanelSettings /> },
  { to: `${base}/seguimientos`, label: "Seguimientos", icon: <Timeline /> },
];

export default function SidebarAdmin() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const userInitials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AD"
    : "AD";

  return (
    <Box
      sx={{
        width: 300,
        bgcolor: "white",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowY: "auto",
        borderRight: "1px solid #e5e7eb",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f5f5f5",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#d1d5db",
          borderRadius: "4px",
          "&:hover": {
            background: "#9ca3af",
          },
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb", textAlign: "center", flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 140,
            height: 140,
            objectFit: "contain",
            mb: 1.5,
            mx: "auto",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1e293b",
            mb: 0.5,
          }}
        >
          Sistema de Admisiones
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            fontSize: "0.875rem",
            color: "#64748b",
          }}
        >
          Administrador
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ py: 2, flexShrink: 0 }}>
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
                  color: isActive ? "white" : "#64748b",
                  "&:hover": {
                    bgcolor: isActive ? "#2563eb" : "#f5f5f5",
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

      {/* User Info Section */}
      <Box sx={{ borderTop: "1px solid #e5e7eb", p: 2, flexShrink: 0 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#8b5cf6",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                fontSize: "0.875rem",
                lineHeight: 1.2,
              }}
            >
              {user?.email?.split("@")[0] || "Administrador"} Usuario
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "admin@correo.com"}
            </Typography>
          </Box>
        </Stack>
        <List dense>
          <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 2, color: "#64748b", py: 1.25, "&:hover": { bgcolor: "#f5f5f5" } }}>
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}><Home /></ListItemIcon>
            <ListItemText primary="Sitio público" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: "#64748b", py: 1.25, "&:hover": { bgcolor: "#f5f5f5" } }}>
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}><ExitToApp /></ListItemIcon>
            <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: "0.9rem" }} />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );
}
