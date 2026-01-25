import { Grid, Stack, Typography, Box } from "@mui/material";
import Timeline from "@mui/icons-material/Timeline";
import Person from "@mui/icons-material/Person";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Phone from "@mui/icons-material/Phone";
import ViewModalBase, { InfoCard, formatDate, getInitials } from "./ViewModalBase";
import type { Seguimiento } from "../services/seguimiento.service";

interface SeguimientoViewModalProps {
  open: boolean;
  onClose: () => void;
  seguimiento: Seguimiento | null;
}

export default function SeguimientoViewModal({ open, onClose, seguimiento }: SeguimientoViewModalProps) {
  if (!seguimiento) return null;

  const clienteNombre = seguimiento.cliente ? `${seguimiento.cliente.nombres} ${seguimiento.cliente.apellidos}` : "Cliente";
  const initials = seguimiento.cliente ? getInitials(seguimiento.cliente.nombres, seguimiento.cliente.apellidos) : "S";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={`Seguimiento - ${clienteNombre}`}
      subtitle="Información completa del seguimiento"
      avatarContent={initials}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Timeline sx={{ color: "#3b82f6", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información del Seguimiento
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="CLIENTE"
              value={clienteNombre}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="FECHA CONTACTO"
              value={formatDate(seguimiento.fecha_contacto)}
              iconColor="#ec4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Phone sx={{ fontSize: 20 }} />}
              label="MEDIO"
              value={seguimiento.medio || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          {seguimiento.comentarios && (
            <Grid item xs={12}>
              <InfoCard
                icon={<Timeline sx={{ fontSize: 20 }} />}
                label="COMENTARIOS"
                value={seguimiento.comentarios}
                iconColor="#64748b"
              />
            </Grid>
          )}
          {seguimiento.proximo_paso && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Timeline sx={{ fontSize: 20 }} />}
                label="PRÓXIMO PASO"
                value={seguimiento.proximo_paso}
                iconColor="#10b981"
              />
            </Grid>
          )}
          {seguimiento.fecha_proximo_contacto && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<CalendarToday sx={{ fontSize: 20 }} />}
                label="FECHA PRÓXIMO CONTACTO"
                value={formatDate(seguimiento.fecha_proximo_contacto)}
                iconColor="#3b82f6"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
