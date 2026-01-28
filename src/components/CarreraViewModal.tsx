import { Grid, Stack, Typography, Box } from "@mui/material";
import School from "@mui/icons-material/School";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import CalendarToday from "@mui/icons-material/CalendarToday";
import ViewModalBase, { InfoCard } from "./ViewModalBase";
import type { Carrera } from "../services/carrera.service";

interface CarreraViewModalProps {
  open: boolean;
  onClose: () => void;
  carrera: Carrera | null;
}

export default function CarreraViewModal({ open, onClose, carrera }: CarreraViewModalProps) {
  if (!carrera) return null;

  const nombreInitial = carrera.nombre_carrera?.[0]?.toUpperCase() || "C";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={carrera.nombre_carrera || "Carrera"}
      subtitle="Información completa de la carrera"
      avatarContent={nombreInitial}
      status={carrera.estado || "Activa"}
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
            Información de la Carrera
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="NOMBRE"
              value={carrera.nombre_carrera || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<BusinessCenter sx={{ fontSize: 20 }} />}
              label="FACULTAD"
              value={carrera.facultad || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="DURACIÓN (SEMESTRES)"
              value={String(carrera.duracion_semestres === 4 ? 6 : (carrera.duracion_semestres ?? "-"))}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="NIVEL DE GRADO"
              value={carrera.nivel_grado || "-"}
              iconColor="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="CUPOS DISPONIBLES"
              value={carrera.cupos_disponibles?.toString() || "-"}
              iconColor="#ec4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={carrera.estado || "Activa"}
              iconColor="#3b82f6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
