import { Grid, Stack, Typography, Box } from "@mui/material";
import CardGiftcard from "@mui/icons-material/CardGiftcard";
import CalendarToday from "@mui/icons-material/CalendarToday";
import AttachMoney from "@mui/icons-material/AttachMoney";
import ViewModalBase, { InfoCard, formatDate } from "./ViewModalBase";
import type { Beca } from "../services/beca.service";

interface BecaViewModalProps {
  open: boolean;
  onClose: () => void;
  beca: Beca | null;
}

export default function BecaViewModal({ open, onClose, beca }: BecaViewModalProps) {
  if (!beca) return null;

  const nombreInitial = beca.nombre_beca?.[0]?.toUpperCase() || "B";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={beca.nombre_beca || "Beca"}
      subtitle="Información completa de la beca"
      avatarContent={nombreInitial}
      status={beca.estado || "Activa"}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CardGiftcard sx={{ color: "#f59e0b", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información de la Beca
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CardGiftcard sx={{ fontSize: 20 }} />}
              label="NOMBRE"
              value={beca.nombre_beca || "-"}
              iconColor="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CardGiftcard sx={{ fontSize: 20 }} />}
              label="TIPO"
              value={beca.tipo_beca || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<AttachMoney sx={{ fontSize: 20 }} />}
              label="% COBERTURA"
              value={`${beca.porcentaje_cobertura || 0}%`}
              iconColor="#10b981"
            />
          </Grid>
          {beca.monto_maximo && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<AttachMoney sx={{ fontSize: 20 }} />}
                label="MONTO MÁXIMO"
                value={`$${beca.monto_maximo.toLocaleString()}`}
                iconColor="#10b981"
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CalendarToday sx={{ fontSize: 20 }} />}
              label="FECHA INICIO"
              value={formatDate(beca.fecha_inicio)}
              iconColor="#ec4899"
            />
          </Grid>
          {beca.fecha_fin && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<CalendarToday sx={{ fontSize: 20 }} />}
                label="FECHA FIN"
                value={formatDate(beca.fecha_fin)}
                iconColor="#ef4444"
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<CardGiftcard sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={beca.estado || "Activa"}
              iconColor="#3b82f6"
            />
          </Grid>
          {beca.descripcion && (
            <Grid item xs={12}>
              <InfoCard
                icon={<CardGiftcard sx={{ fontSize: 20 }} />}
                label="DESCRIPCIÓN"
                value={beca.descripcion}
                iconColor="#64748b"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
