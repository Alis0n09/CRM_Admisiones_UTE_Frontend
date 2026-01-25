import { Grid, Stack, Typography, Box, Chip } from "@mui/material";
import School from "@mui/icons-material/School";
import Person from "@mui/icons-material/Person";
import CalendarToday from "@mui/icons-material/CalendarToday";
import ViewModalBase, { InfoCard, formatDate, getInitials } from "./ViewModalBase";
import type { Postulacion } from "../services/postulacion.service";

interface PostulacionViewModalProps {
  open: boolean;
  onClose: () => void;
  postulacion: Postulacion | null;
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("revisión")) return "info";
  if (estadoLower.includes("aprobada")) return "success";
  if (estadoLower.includes("rechazada")) return "error";
  return "default";
}

export default function PostulacionViewModal({ open, onClose, postulacion }: PostulacionViewModalProps) {
  if (!postulacion) return null;

  const clienteNombre = postulacion.cliente ? `${postulacion.cliente.nombres} ${postulacion.cliente.apellidos}` : "Aspirante";
  const initials = postulacion.cliente ? getInitials(postulacion.cliente.nombres, postulacion.cliente.apellidos) : "P";
  const estadoColor = getEstadoColor(postulacion.estado_postulacion);

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={`Postulación de ${clienteNombre}`}
      subtitle="Información completa de la postulación"
      avatarContent={initials}
      status={postulacion.estado_postulacion || "Pendiente"}
      statusColor={estadoColor === "success" ? "rgba(16, 185, 129, 0.3)" : estadoColor === "error" ? "rgba(239, 68, 68, 0.3)" : "rgba(255,255,255,0.25)"}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <School sx={{ color: "#8b5cf6", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información de la Postulación
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="ASPIRANTE"
              value={clienteNombre}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="CARRERA"
              value={postulacion.carrera?.nombre_carrera || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="PERÍODO ACADÉMICO"
              value={postulacion.periodo_academico || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="FECHA POSTULACIÓN"
              value={formatDate(postulacion.fecha_postulacion)}
              iconColor="#ec4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={postulacion.estado_postulacion || "Pendiente"}
              iconColor="#3b82f6"
            />
          </Grid>
          {postulacion.observaciones && (
            <Grid item xs={12}>
              <InfoCard
                icon={<School sx={{ fontSize: 20 }} />}
                label="OBSERVACIONES"
                value={postulacion.observaciones}
                iconColor="#64748b"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
