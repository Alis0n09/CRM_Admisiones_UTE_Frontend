import { Grid, Stack, Typography, Box, Chip } from "@mui/material";
import Assignment from "@mui/icons-material/Assignment";
import Person from "@mui/icons-material/Person";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Event from "@mui/icons-material/Event";
import ViewModalBase, { InfoCard, formatDate, getInitials } from "./ViewModalBase";
import type { TareaCrm } from "../services/tarea.service";

interface TareaViewModalProps {
  open: boolean;
  onClose: () => void;
  tarea: TareaCrm | null;
}

function getEstadoColor(estado?: string) {
  if (!estado) return "default";
  const estadoLower = estado.toLowerCase();
  if (estadoLower.includes("pendiente")) return "warning";
  if (estadoLower.includes("proceso")) return "info";
  if (estadoLower.includes("completada")) return "success";
  return "default";
}

export default function TareaViewModal({ open, onClose, tarea }: TareaViewModalProps) {
  if (!tarea) return null;

  const descripcionInitial = tarea.descripcion?.[0]?.toUpperCase() || "T";
  const estadoColor = getEstadoColor(tarea.estado);

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={tarea.descripcion || "Tarea"}
      subtitle="Información completa de la tarea"
      avatarContent={descripcionInitial}
      status={tarea.estado || "Pendiente"}
      statusColor={estadoColor === "success" ? "rgba(16, 185, 129, 0.3)" : estadoColor === "warning" ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.25)"}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Assignment sx={{ color: "#f59e0b", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información de la Tarea
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InfoCard
              icon={<Assignment sx={{ fontSize: 20 }} />}
              label="DESCRIPCIÓN"
              value={tarea.descripcion || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="ASESOR (EMPLEADO)"
              value={tarea.empleado ? `${tarea.empleado.nombres} ${tarea.empleado.apellidos}` : "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Person sx={{ fontSize: 20 }} />}
              label="CLIENTE"
              value={tarea.cliente ? `${tarea.cliente.nombres} ${tarea.cliente.apellidos}` : "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="FECHA ASIGNACIÓN"
              value={formatDate(tarea.fecha_asignacion)}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Event sx={{ fontSize: 20 }} />}
              label="FECHA VENCIMIENTO"
              value={formatDate(tarea.fecha_vencimiento)}
              iconColor="#ef4444"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Assignment sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={tarea.estado || "Pendiente"}
              iconColor="#3b82f6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
