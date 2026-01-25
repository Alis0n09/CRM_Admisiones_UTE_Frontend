import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
import * as empleadoService from "../../services/empleado.service";
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
  const [empleadoInfo, setEmpleadoInfo] = useState<{ nombres?: string; apellidos?: string } | null>(null);
  useEffect(() => {
    if (user?.id_empleado) {
      empleadoService.getEmpleado(user.id_empleado)
        .then((empleado) => {
          setEmpleadoInfo({ nombres: empleado.nombres, apellidos: empleado.apellidos });
        })
        .catch(() => {
          setEmpleadoInfo(null);
        });
    }
  }, [user?.id_empleado]);
  const nombreCompleto = empleadoInfo ? `${empleadoInfo.nombres || ""} ${empleadoInfo.apellidos || ""}`.trim() : null;
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
      <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Logo"
          sx={{
            width: 140,
            height: 140,
            objectFit: "contain",
            mb: 2,
            mx: "auto",
            display: "block",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        <Box sx={{ px: 1 }}>
          <Typography variant="body1" fontWeight={700} sx={{ color: "#1e293b", fontSize: "0.95rem", lineHeight: 1.3 }}>
            {nombreCompleto || user?.email?.split("@")[0] || ""}
          </Typography>
          {user?.email && (
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.3 }}>
              {user.email}
            </Typography>
          )}
        </Box>
      </Box>
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
      <Box sx={{ borderTop: "1px solid #e5e7eb", p: 2, flexShrink: 0, mt: "auto" }}>
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
