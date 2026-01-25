import { Grid, Stack, Typography, Box, Button, Dialog } from "@mui/material";
import Description from "@mui/icons-material/Description";
import AttachFile from "@mui/icons-material/AttachFile";
import School from "@mui/icons-material/School";
import DownloadIcon from "@mui/icons-material/Download";
import ViewModalBase, { InfoCard } from "./ViewModalBase";
import type { DocumentoPostulacion } from "../services/documentoPostulacion.service";

interface DocumentoViewModalProps {
  open: boolean;
  onClose: () => void;
  documento: DocumentoPostulacion | null;
  onDownload?: (url: string, nombre: string) => void;
}

export default function DocumentoViewModal({ open, onClose, documento, onDownload }: DocumentoViewModalProps) {
  if (!documento) return null;

  const tipoInitial = documento.tipo_documento?.[0]?.toUpperCase() || "D";

  return (
    <ViewModalBase
      open={open}
      onClose={onClose}
      title={documento.tipo_documento || "Documento"}
      subtitle="Información completa del documento"
      avatarContent={tipoInitial}
      status={documento.estado_documento || "Pendiente"}
      actions={
        documento.url_archivo && onDownload ? (
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => onDownload(documento.url_archivo!, documento.nombre_archivo || "documento")}
            sx={{
              textTransform: "none",
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" }
            }}
          >
            Descargar archivo
          </Button>
        ) : undefined
      }
    >
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Description sx={{ color: "#3b82f6", fontSize: 20 }} />
          <Typography
            variant="h6"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "1.125rem",
            }}
          >
            Información del Documento
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Description sx={{ fontSize: 20 }} />}
              label="TIPO DE DOCUMENTO"
              value={documento.tipo_documento || "-"}
              iconColor="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<AttachFile sx={{ fontSize: 20 }} />}
              label="NOMBRE ARCHIVO"
              value={documento.nombre_archivo || "-"}
              iconColor="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard
              icon={<Description sx={{ fontSize: 20 }} />}
              label="ESTADO"
              value={documento.estado_documento || "Pendiente"}
              iconColor="#f59e0b"
            />
          </Grid>
          {documento.postulacion?.cliente && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<School sx={{ fontSize: 20 }} />}
                label="ASPIRANTE"
                value={`${documento.postulacion.cliente.nombres} ${documento.postulacion.cliente.apellidos}`}
                iconColor="#10b981"
              />
            </Grid>
          )}
          {documento.postulacion?.carrera && (
            <Grid item xs={12} sm={6} md={4}>
              <InfoCard
                icon={<School sx={{ fontSize: 20 }} />}
                label="CARRERA"
                value={documento.postulacion.carrera.nombre_carrera}
                iconColor="#8b5cf6"
              />
            </Grid>
          )}
          {documento.observaciones && (
            <Grid item xs={12}>
              <InfoCard
                icon={<Description sx={{ fontSize: 20 }} />}
                label="OBSERVACIONES"
                value={documento.observaciones}
                iconColor="#64748b"
              />
            </Grid>
          )}
          {documento.url_archivo && (
            <Grid item xs={12}>
              <InfoCard
                icon={<AttachFile sx={{ fontSize: 20 }} />}
                label="URL ARCHIVO"
                value={documento.url_archivo}
                iconColor="#3b82f6"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </ViewModalBase>
  );
}
