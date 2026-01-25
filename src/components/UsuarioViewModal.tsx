import { Grid, Stack, Typography, Box } from "@mui/material";
import Email from "@mui/icons-material/Email";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Person from "@mui/icons-material/Person";
import ViewModalBase, { InfoCard } from "./ViewModalBase";
import type { Usuario } from "../services/usuario.service";

interface UsuarioViewModalProps {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

export default function UsuarioViewModal({ open, onClose, usuario }: UsuarioViewModalProps) {
  if (!usuario) return null;

  const emailInitial = usuario.email?.[0]?.toUpperCase() || "U";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={usuario.email || "Usuario"}
      subtitle="Información completa del usuario"
      avatarContent={emailInitial}
      status={usuario.activo ? "Activo" : "Inactivo"}
      statusColor={usuario.activo ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Person sx={{ color: "#3b82f6", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información del Usuario
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={
                <Box sx={{ position: "relative" }}>
                  <Email sx={{ fontSize: 20 }} />
                  <CheckCircle
                    sx={{
                      fontSize: 12,
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      color: "#10b981",
                      bgcolor: "white",
                      borderRadius: "50%",
                    }}
                  />
                </Box>
              }
              label="EMAIL"
              value={usuario.email || "-"}
              iconColor="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={usuario.activo ? "Activo" : "Inactivo"}
              iconColor={usuario.activo ? "#10b981" : "#ef4444"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="EMPLEADO"
              value={usuario.empleado ? `${usuario.empleado.nombres} ${usuario.empleado.apellidos}` : usuario.id_empleado || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="CLIENTE"
              value={usuario.cliente ? `${usuario.cliente.nombres} ${usuario.cliente.apellidos}` : usuario.id_cliente || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
