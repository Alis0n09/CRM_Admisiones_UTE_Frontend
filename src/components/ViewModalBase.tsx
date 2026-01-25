import {
  Dialog,
  Box,
  Avatar,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";

interface ViewModalBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  avatarContent: React.ReactNode;
  status?: string;
  statusColor?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function InfoCard({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: string; iconColor: string }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        height: "100%",
        bgcolor: "white",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box sx={{ color: iconColor, display: "flex", alignItems: "center", mt: 0.5 }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                fontWeight: 500,
                display: "block",
                mb: 0.5,
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#1e293b",
                fontWeight: 700,
                fontSize: "0.875rem",
                wordBreak: "break-word",
              }}
            >
              {value || "-"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

export default function ViewModalBase({
  open,
  onClose,
  title,
  subtitle,
  avatarContent,
  status,
  statusColor = "rgba(255,255,255,0.25)",
  children,
  actions,
}: ViewModalBaseProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header con gradiente morado */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          p: 4,
          position: "relative",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontSize: "1.5rem",
              fontWeight: 700,
            }}
          >
            {avatarContent}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: 700,
                mb: 0.5,
                fontSize: "1.5rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem",
              }}
            >
              {subtitle}
            </Typography>
          </Box>
          {status && (
            <Chip
              label={status}
              sx={{
                bgcolor: statusColor,
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                height: 32,
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Contenido */}
      <Box sx={{ p: 3, bgcolor: "#f9fafb", maxHeight: "calc(90vh - 200px)", overflowY: "auto" }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "white",
        }}
      >
        {actions && (
          <Box>
            {actions}
          </Box>
        )}
        <Button
          onClick={onClose}
          sx={{
            color: "#3b82f6",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
            ml: actions ? "auto" : 0,
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.1)",
            },
          }}
        >
          CERRAR
        </Button>
      </Box>
    </Dialog>
  );
}
