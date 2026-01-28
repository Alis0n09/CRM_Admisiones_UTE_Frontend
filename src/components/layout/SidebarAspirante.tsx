import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Person from "@mui/icons-material/Person";
import Description from "@mui/icons-material/Description";
import Dashboard from "@mui/icons-material/Dashboard";
import ExitToApp from "@mui/icons-material/ExitToApp";
import Home from "@mui/icons-material/Home";
import { useAuth } from "../../context/AuthContext";

const base = "/aspirante";

const links = [
  { to: `${base}/solicitud`, label: "Mi Solicitud", icon: <Dashboard /> },
  { to: `${base}/documentos`, label: "Documentos", icon: <Description /> },
  { to: `${base}/perfil`, label: "Mi Perfil", icon: <Person /> },
];

export default function SidebarAspirante() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "white",
        borderRight: "1px solid #eee",
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      {/* Header (como el diseño del asesor) */}
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Box
          sx={{ mb: 1.5, display: "flex", justifyContent: "center" }}
        >
          <Box sx={{ width: 90, height: 90 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </Box>
        </Box>
        <Typography fontWeight={700} sx={{ color: "#1e293b" }}>
          Aspirante · UTE Admisiones
        </Typography>
        {user?.email && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {user.email}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" sx={{ color: "text.secondary", px: 2 }}>
        MENÚ
      </Typography>

      {/* Navigation Links */}
      <List dense sx={{ flex: 1 }}>
        {links.map(({ to, label, icon }) => {
          const isSelected = location.pathname === to || (to === `${base}/solicitud` && location.pathname === base);
          return (
            <ListItemButton
              key={to}
              component={RouterLink}
              to={to}
              selected={isSelected}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.25,
                "&.Mui-selected": {
                  bgcolor: "#eef2ff",
                  "&:hover": { bgcolor: "#e0e7ff" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isSelected ? "#4f46e5" : "text.secondary" }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500, color: "#111827", fontSize: "0.92rem" }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <List dense>
        <ListItemButton component={RouterLink} to="/" sx={{ borderRadius: 1, mx: 1, my: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Sitio público" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, mx: 1, my: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </Box>
  );
}
