import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Stack } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import Description from "@mui/icons-material/Description";
import Timeline from "@mui/icons-material/Timeline";
import Dashboard from "@mui/icons-material/Dashboard";
import CalendarToday from "@mui/icons-material/CalendarToday";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Home from "@mui/icons-material/Home";
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
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const userInitials = user?.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "AS"
    : "AS";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255,255,255,0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255,255,255,0.2)",
          borderRadius: "4px",
          "&:hover": {
            background: "rgba(255,255,255,0.3)",
          },
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "center", flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 60,
            height: 60,
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
            color: "white",
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
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Asesor
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

      {/* User Info Section */}
      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", p: 2, flexShrink: 0 }}>
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
                color: "white",
                fontSize: "0.875rem",
                lineHeight: 1.2,
              }}
            >
              {user?.email?.split("@")[0] || "Asesor"} Usuario
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.75rem",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || "asesor@correo.com"}
            </Typography>
          </Box>
        </Stack>
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

      {/* Botón Cerrar Sesión */}
      <Box sx={{ px: 1, pb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "error.main",
            "&:hover": {
              bgcolor: "error.light",
              color: "error.dark",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </Box>
    </Box>
  );
}
