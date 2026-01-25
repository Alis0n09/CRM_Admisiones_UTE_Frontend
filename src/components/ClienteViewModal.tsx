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
import Person from "@mui/icons-material/Person";
import Email from "@mui/icons-material/Email";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Phone from "@mui/icons-material/Phone";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Public from "@mui/icons-material/Public";
import School from "@mui/icons-material/School";
import BusinessCenter from "@mui/icons-material/BusinessCenter";
import type { Cliente } from "../services/cliente.service";
import { useEffect, useState } from "react";
import * as postulacionService from "../services/postulacion.service";

interface ClienteViewModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

function formatDate(dateStr?: string): string {
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

function getInitials(nombres?: string, apellidos?: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor: string;
}

function InfoCard({ icon, label, value, iconColor }: InfoCardProps) {
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

export default function ClienteViewModal({ open, onClose, cliente }: ClienteViewModalProps) {
  const [postulacionesCount, setPostulacionesCount] = useState(0);

  useEffect(() => {
    if (cliente?.id_cliente) {
      postulacionService
        .getPostulaciones({ limit: 1000 })
        .then((r: any) => {
          const postulaciones = Array.isArray(r) ? r : r?.items ?? [];
          const count = postulaciones.filter(
            (p: any) => p.id_cliente === cliente.id_cliente || (p.cliente as any)?.id_cliente === cliente.id_cliente
          ).length;
          setPostulacionesCount(count);
        })
        .catch(() => setPostulacionesCount(0));
    }
  }, [cliente?.id_cliente]);

  if (!cliente) return null;

  const initials = getInitials(cliente.nombres, cliente.apellidos);
  const nombreCompleto = `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();

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
            {initials}
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
              {nombreCompleto}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.875rem",
              }}
            >
              Información completa del aspirante
            </Typography>
          </Box>
          <Chip
            label={cliente.estado || "Nuevo"}
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.875rem",
              height: 32,
            }}
          />
        </Stack>
      </Box>

      {/* Contenido */}
      <Box sx={{ p: 3, bgcolor: "#f9fafb", maxHeight: "calc(90vh - 200px)", overflowY: "auto" }}>
        {/* Información Personal */}
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
                value={cliente.nombres || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Person sx={{ fontSize: 20 }} />}
                label="APELLIDOS"
                value={cliente.apellidos || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<BusinessCenter sx={{ fontSize: 20 }} />}
                label={cliente.tipo_identificacion?.toUpperCase() || "IDENTIFICACIÓN"}
                value={cliente.numero_identificacion || "-"}
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
                value={cliente.correo || "-"}
                iconColor="#10b981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Phone sx={{ fontSize: 20 }} />}
                label="TELÉFONO"
                value={cliente.telefono || "-"}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Phone sx={{ fontSize: 20 }} />}
                label="CELULAR"
                value={cliente.celular || "-"}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<CalendarToday sx={{ fontSize: 20 }} />}
                label="FECHA DE NACIMIENTO"
                value={formatDate(cliente.fecha_nacimiento)}
                iconColor="#ec4899"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Person sx={{ fontSize: 20 }} />}
                label="GÉNERO"
                value={cliente.genero || "-"}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Public sx={{ fontSize: 20 }} />}
                label="NACIONALIDAD"
                value={cliente.nacionalidad || "-"}
                iconColor="#ef4444"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<Public sx={{ fontSize: 20 }} />}
                label="ORIGEN"
                value={cliente.origen || "-"}
                iconColor="#ef4444"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Postulaciones */}
        <Box>
          <Box
            sx={{
              bgcolor: "#f59e0b",
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <School sx={{ color: "white", fontSize: 20 }} />
              <Typography
                variant="h6"
                sx={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "1.125rem",
                }}
              >
                Postulaciones ({postulacionesCount})
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "flex-end",
          bgcolor: "white",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#3b82f6",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.9rem",
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
