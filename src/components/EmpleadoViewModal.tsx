import { Grid, Stack, Typography, Box } from "@mui/material";
import Person from "@mui/icons-material/Person";
import Email from "@mui/icons-material/Email";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Phone from "@mui/icons-material/Phone";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import ViewModalBase, { InfoCard, getInitials } from "./ViewModalBase";
import type { Empleado } from "../services/empleado.service";

interface EmpleadoViewModalProps {
  open: boolean;
  onClose: () => void;
  empleado: Empleado | null;
}

export default function EmpleadoViewModal({ open, onClose, empleado }: EmpleadoViewModalProps) {
  if (!empleado) return null;

  const initials = getInitials(empleado.nombres, empleado.apellidos);
  const nombreCompleto = `${empleado.nombres || ""} ${empleado.apellidos || ""}`.trim();

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={nombreCompleto}
      subtitle="Información completa del empleado"
      avatarContent={initials}
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
            Información Personal
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="NOMBRES"
              value={empleado.nombres || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="APELLIDOS"
              value={empleado.apellidos || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<BusinessCenter sx={{ fontSize: 20 }} />}
              label={empleado.tipo_identificacion?.toUpperCase() || "IDENTIFICACIÓN"}
              value={empleado.numero_identificacion || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
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
              label="CORREO ELECTRÓNICO"
              value={empleado.correo || "-"}
              iconColor="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Phone sx={{ fontSize: 20 }} />}
              label="TELÉFONO"
              value={empleado.telefono || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<BusinessCenter sx={{ fontSize: 20 }} />}
              label="DEPARTAMENTO"
              value={empleado.departamento || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
