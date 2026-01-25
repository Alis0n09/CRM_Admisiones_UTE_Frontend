import { Grid, Stack, Typography, Box } from "@mui/material";
import School from "@mui/icons-material/School";
import Person from "@mui/icons-material/Person";
import CalendarToday from "@mui/icons-material/CalendarToday";
import ViewModalBase, { InfoCard, formatDate, getInitials } from "./ViewModalBase";
import type { Matricula } from "../services/matricula.service";

interface MatriculaViewModalProps {
  open: boolean;
  onClose: () => void;
  matricula: Matricula | null;
}

export default function MatriculaViewModal({ open, onClose, matricula }: MatriculaViewModalProps) {
  if (!matricula) return null;

  const clienteNombre = matricula.cliente ? `${matricula.cliente.nombres} ${matricula.cliente.apellidos}` : "Cliente";
  const initials = matricula.cliente ? getInitials(matricula.cliente.nombres, matricula.cliente.apellidos) : "M";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={`Matrícula - ${clienteNombre}`}
      subtitle="Información completa de la matrícula"
      avatarContent={initials}
      status={matricula.estado || "Activa"}
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
            Información de la Matrícula
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
              icon={<School sx={{ fontSize: 20 }} />}
              label="CARRERA"
              value={matricula.carrera?.nombre_carrera || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="PERÍODO ACADÉMICO"
              value={matricula.periodo_academico || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="FECHA MATRÍCULA"
              value={formatDate(matricula.fecha_matricula)}
              iconColor="#ec4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<School sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={matricula.estado || "Activa"}
              iconColor="#3b82f6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
