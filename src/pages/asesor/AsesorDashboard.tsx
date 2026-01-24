import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Link,
  Grid,
} from "@mui/material";
import People from "@mui/icons-material/People";
import AccessTime from "@mui/icons-material/AccessTime";
import CalendarToday from "@mui/icons-material/CalendarToday";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import * as clienteService from "../../services/cliente.service";
import * as tareaService from "../../services/tarea.service";
import * as postulacionService from "../../services/postulacion.service";
import type { Cliente } from "../../services/cliente.service";
import type { Postulacion } from "../../services/postulacion.service";

function toItems(res: any): number {
  if (Array.isArray(res)) return res.length;
  return res?.items?.length ?? res?.meta?.totalItems ?? 0;
}

function getInitials(nombres: string, apellidos: string): string {
  const first = nombres?.[0]?.toUpperCase() || "";
  const last = apellidos?.[0]?.toUpperCase() || "";
  return first + last;
}

export default function AsesorDashboard() {
  const [counts, setCounts] = useState({
    asignados: 0,
    pendientes: 0,
    entrevistas: 0,
    completados: 0,
  });
  const [aspirantes, setAspirantes] = useState<Cliente[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

  useEffect(() => {
    // Cargar conteos
    Promise.all([
      clienteService.getClientes({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      tareaService.getTareas({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      postulacionService.getPostulaciones({ limit: 1 }).catch(() => ({ items: [], meta: { totalItems: 0 } })),
    ]).then(([c, t, p]) => {
      const totalClientes = (c as any)?.meta?.totalItems ?? toItems(c);
      const totalTareas = (t as any)?.meta?.totalItems ?? toItems(t);
      const totalPostulaciones = (p as any)?.meta?.totalItems ?? (Array.isArray(p) ? (p as any).length : toItems(p));
      
      setCounts({
        asignados: totalClientes,
        pendientes: totalTareas,
        entrevistas: 3, // Mock data - debería venir de un servicio de entrevistas
        completados: Math.floor(totalPostulaciones * 0.65), // Mock data
      });
    });

    // Cargar aspirantes recientes
    clienteService
      .getClientes({ limit: 5 })
      .then((res: any) => {
        setAspirantes(res?.items ?? []);
      })
      .catch(() => setAspirantes([]));

    // Cargar postulaciones para entrevistas
    postulacionService
      .getPostulaciones({ limit: 5 })
      .then((res: any) => {
        setPostulaciones(res?.items ?? []);
      })
      .catch(() => setPostulaciones([]));
  }, []);

  const metricCards = [
    {
      title: "Aspirantes Asignados",
      value: counts.asignados,
      icon: <People fontSize="large" />,
      color: "#3b82f6",
    },
    {
      title: "Pendientes de Revisar",
      value: counts.pendientes,
      icon: <AccessTime fontSize="large" />,
      color: "#8b5cf6",
    },
    {
      title: "Entrevistas Hoy",
      value: counts.entrevistas,
      icon: <CalendarToday fontSize="large" />,
      color: "#10b981",
    },
    {
      title: "Completados",
      value: counts.completados,
      icon: <CheckCircle fontSize="large" />,
      color: "#3b82f6",
    },
  ];

  // Mock data para entrevistas de hoy
  const entrevistasHoy = [
    {
      id: "1",
      nombre: "Roberto Silva",
      hora: "10:00 AM",
      inicial: "R",
    },
    {
      id: "2",
      nombre: "Ana Jiménez",
      hora: "02:00 PM",
      inicial: "A",
    },
  ];

  const getEstadoColor = (estado?: string) => {
    if (!estado) return "default";
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("alta") || estadoLower.includes("urgente")) return "error";
    if (estadoLower.includes("media")) return "warning";
    if (estadoLower.includes("baja")) return "info";
    return "default";
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Tarjetas de métricas */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, width: "100%" }}>
        {metricCards.map((card) => (
          <Box key={card.title} sx={{ flex: "1 1 0", minWidth: 0 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: "white",
                height: "100%",
                width: "100%",
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 4, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5, fontSize: "0.875rem" }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: card.color, fontSize: "2.5rem" }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ color: card.color, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 80 }}>
                  <Box sx={{ fontSize: "3.5rem" }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Sección inferior: Mis Aspirantes y Eventos */}
      <Grid container spacing={3} sx={{ width: "100%" }}>
        {/* Mis Aspirantes */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: "white", width: "100%", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Mis Aspirantes
                </Typography>
                <Link
                  component={RouterLink}
                  to="/asesor/clientes"
                  sx={{ textDecoration: "none", color: "#3b82f6", fontWeight: 500 }}
                >
                  Ver todos
                </Link>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {aspirantes.slice(0, 2).map((aspirante) => {
                  const postulacion = postulaciones.find((p) => p.id_cliente === aspirante.id_cliente);
                  const estado = aspirante.estado || "Nuevo";
                  const prioridad = estado.includes("alta") ? "alta" : estado.includes("media") ? "media" : "baja";
                  
                  return (
                    <Box
                      key={aspirante.id_cliente}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f9fafb",
                        "&:hover": { bgcolor: "#f3f4f6" },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "#8b5cf6",
                          width: 48,
                          height: 48,
                          fontSize: "1rem",
                        }}
                      >
                        {getInitials(aspirante.nombres, aspirante.apellidos)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {aspirante.nombres} {aspirante.apellidos}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {postulacion?.carrera?.nombre_carrera || "Programa no asignado"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {postulacion?.estado_postulacion || estado}
                        </Typography>
                      </Box>
                      <Chip
                        label={prioridad}
                        size="small"
                        color={getEstadoColor(prioridad) as any}
                        sx={{ mr: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        component={RouterLink}
                        to={`/asesor/clientes`}
                        sx={{
                          bgcolor: "#3b82f6",
                          "&:hover": { bgcolor: "#2563eb" },
                        }}
                      >
                        Revisar
                      </Button>
                    </Box>
                  );
                })}
                {aspirantes.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    No hay aspirantes asignados
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Eventos de Hoy */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: "white", width: "100%", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Eventos de Hoy
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {entrevistasHoy.map((entrevista) => (
                  <Box
                    key={entrevista.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#f9fafb",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#10b981",
                        width: 40,
                        height: 40,
                        fontSize: "0.875rem",
                      }}
                    >
                      {entrevista.inicial}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {entrevista.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entrevista.hora}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        fontSize: "0.75rem",
                        px: 1.5,
                        py: 0.5,
                        minWidth: "auto",
                        "&:hover": {
                          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                        },
                      }}
                    >
                      Contactar
                    </Button>
                  </Box>
                ))}
                {entrevistasHoy.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    No hay entrevistas programadas para hoy
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
