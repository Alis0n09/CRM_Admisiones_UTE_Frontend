import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Stack } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Person from "@mui/icons-material/Person";
import Description from "@mui/icons-material/Description";
import Dashboard from "@mui/icons-material/Dashboard";
import ExitToApp from "@mui/icons-material/ExitToApp";
import { useAuth } from "../../context/AuthContext";
import * as clienteService from "../../services/cliente.service";
import Logo from "../Logo";
const base = "/aspirante";
const links = [
  { to: `${base}/solicitud`, label: "Mi Solicitud", icon: <Dashboard /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/perfil`, label: "Mi Perfil", icon: <Person /> },
];
export default function SidebarAspirante() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [clienteInfo, setClienteInfo] = useState<{ nombres?: string; apellidos?: string } | null>(null);
  useEffect(() => {
    if (user?.id_cliente) {
      clienteService.getCliente(user.id_cliente)
        .then((cliente) => {
          setClienteInfo({ nombres: cliente.nombres, apellidos: cliente.apellidos });
        })
        .catch(() => {
          setClienteInfo(null);
        });
    }
  }, [user?.id_cliente]);
  const nombreCompleto = clienteInfo ? `${clienteInfo.nombres || ""} ${clienteInfo.apellidos || ""}`.trim() : null;
  const getInitials = (nombres?: string, apellidos?: string, email?: string): string => {
    if (nombres && apellidos) {
      return `${nombres[0] || ""}${apellidos[0] || ""}`.toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "A";
  };
  const initials = getInitials(clienteInfo?.nombres, clienteInfo?.apellidos, user?.email);
  return (
    <Box sx={{ width: 260, bgcolor: "white", borderRight: "1px solid #eee", p: 2, display: "flex", flexDirection: "column" }}>
      <Box sx={{ py: 2 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
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
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#8b5cf6",
              color: "white",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight={700} sx={{ color: "#1e293b", fontSize: "0.95rem", lineHeight: 1.3 }}>
              {nombreCompleto || "Aspirante"}
            </Typography>
            {user?.email && (
              <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8rem", lineHeight: 1.3 }}>
                {user.email}
              </Typography>
            )}
          </Box>
        </Stack>
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
