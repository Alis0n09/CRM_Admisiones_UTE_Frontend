import { Grid, Stack, Typography, Box } from "@mui/material";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import ViewModalBase, { InfoCard } from "./ViewModalBase";
import type { Rol } from "../services/rol.service";

interface RolViewModalProps {
  open: boolean;
  onClose: () => void;
  rol: Rol | null;
}

export default function RolViewModal({ open, onClose, rol }: RolViewModalProps) {
  if (!rol) return null;

  const nombreInitial = rol.nombre?.[0]?.toUpperCase() || "R";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={rol.nombre || "Rol"}
      subtitle="Información completa del rol"
      avatarContent={nombreInitial}
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AdminPanelSettings sx={{ color: "#8b5cf6", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información del Rol
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<AdminPanelSettings sx={{ fontSize: 20 }} />}
              label="NOMBRE"
              value={rol.nombre || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
