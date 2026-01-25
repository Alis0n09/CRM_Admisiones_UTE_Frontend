import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import People from "@mui/icons-material/People";
import Badge from "@mui/icons-material/Badge";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import Campaign from "@mui/icons-material/Campaign";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as clienteService from "../../services/cliente.service";
import * as empleadoService from "../../services/empleado.service";
import * as tareaService from "../../services/tarea.service";
import * as postulacionService from "../../services/postulacion.service";
import * as carreraService from "../../services/carrera.service";
import * as becaService from "../../services/beca.service";
import * as usuarioService from "../../services/usuario.service";

function toItems(res: any): number {
  if (Array.isArray(res)) return res.length;
  return res?.items?.length ?? res?.meta?.totalItems ?? 0;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    clientes: 0,
    empleados: 0,
    tareas: 0,
    postulaciones: 0,
    carreras: 0,
    becas: 0,
    usuarios: 0,
  });
  const [postulacionStats, setPostulacionStats] = useState({
    aprobadas: 0,
    enProceso: 0,
    pendientes: 0,
    rechazadas: 0,
    total: 0,
  });
  const [timeRange, setTimeRange] = useState("daily");

  useEffect(() => {
    Promise.all([
      clienteService.getClientes({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      empleadoService.getEmpleados({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      tareaService.getTareas({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      postulacionService.getPostulaciones({ limit: 1000 }).catch(() => ({ items: [], meta: { totalItems: 0 } })),
      carreraService.getCarreras({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      becaService.getBecas({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      usuarioService.getUsuarios().catch(() => []),
    ]).then(([c, e, t, p, car, b, u]) => {
      const postulaciones = Array.isArray(p) ? p : (p as any)?.items ?? [];
      const totalPostulaciones = (p as any)?.meta?.totalItems ?? postulaciones.length;
      
      // Calcular estadísticas por estado
      const aprobadas = postulaciones.filter((post: any) => 
        post.estado_postulacion?.toLowerCase().includes("aprob") || 
        post.estado_postulacion === "Aprobada"
      ).length;
      const enProceso = postulaciones.filter((post: any) => 
        post.estado_postulacion?.toLowerCase().includes("proceso") ||
        post.estado_postulacion?.toLowerCase().includes("revisión") ||
        post.estado_postulacion === "En Proceso"
      ).length;
      const pendientes = postulaciones.filter((post: any) => 
        post.estado_postulacion?.toLowerCase().includes("pendiente") ||
        post.estado_postulacion === "Pendiente" ||
        !post.estado_postulacion
      ).length;
      const rechazadas = postulaciones.filter((post: any) => 
        post.estado_postulacion?.toLowerCase().includes("rechaz") ||
        post.estado_postulacion === "Rechazada"
      ).length;

      setPostulacionStats({
        aprobadas,
        enProceso,
        pendientes,
        rechazadas,
        total: totalPostulaciones,
      });

      const usuarios = Array.isArray(u) ? u : [];
      
      setCounts({
        clientes: (c as any)?.meta?.totalItems ?? toItems(c),
        empleados: (e as any)?.meta?.totalItems ?? toItems(e),
        tareas: (t as any)?.meta?.totalItems ?? toItems(t),
        postulaciones: totalPostulaciones,
        carreras: (car as any)?.meta?.totalItems ?? toItems(car),
        becas: (b as any)?.meta?.totalItems ?? toItems(b),
        usuarios: usuarios.length,
      });
    });
  }, []);

  // Tarjetas navegables con diseño estilo estadísticas
  const navigationCards = [
    {
      title: "Clientes",
      count: counts.clientes,
      icon: <People sx={{ fontSize: 32 }} />,
      iconColor: "#3b82f6", // Azul
      route: "/admin/clientes",
    },
    {
      title: "Postulaciones",
      count: counts.postulaciones,
      icon: <Campaign sx={{ fontSize: 32 }} />,
      iconColor: "#8b5cf6", // Morado
      route: "/admin/postulaciones",
    },
    {
      title: "Carreras",
      count: counts.carreras,
      icon: <EmojiEvents sx={{ fontSize: 32 }} />,
      iconColor: "#10b981", // Verde
      route: "/admin/carreras",
    },
    {
      title: "Empleados",
      count: counts.empleados,
      icon: <Badge sx={{ fontSize: 32 }} />,
      iconColor: "#3b82f6", // Azul
      route: "/admin/empleados",
    },
    {
      title: "Tareas",
      count: counts.tareas,
      icon: <AccessTimeIcon sx={{ fontSize: 32 }} />,
      iconColor: "#8b5cf6", // Morado
      route: "/admin/tareas",
    },
    {
      title: "Becas",
      count: counts.becas,
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      iconColor: "#3b82f6", // Azul
      route: "/admin/becas",
    },
    {
      title: "Usuarios",
      count: counts.usuarios,
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      iconColor: "#10b981", // Verde
      route: "/admin/usuarios",
    },
  ];


  // Estadísticas de tareas
  const taskStats = {
    completed: { value: 10, total: 75, color: "#10b981" }, // Verde
    inProgress: { value: 45, total: 75, color: "#3b82f6" }, // Azul
    notStarted: { value: 20, total: 75, color: "#8b5cf6" }, // Morado
  };

  const totalHours = "36h 29 min";

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mx: -3, px: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "#1e293b" }}>
        Dashboard
      </Typography>

      {/* Navigation Cards - Diseño estilo estadísticas */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
        {navigationCards.map((card, index) => (
          <Card
            key={index}
            onClick={() => navigate(card.route)}
            sx={{
              flex: { xs: "1 1 calc(50% - 0.75rem)", md: "1 1 calc(25% - 1.125rem)" },
              minWidth: { xs: "calc(50% - 0.75rem)", md: "calc(25% - 1.125rem)" },
              borderRadius: 2,
              bgcolor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  {/* Título pequeño arriba */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500, 
                      fontSize: "0.875rem", 
                      color: "#64748b",
                      mb: 1,
                      lineHeight: 1.2
                    }}
                  >
                    {card.title}
                  </Typography>
                  {/* Número grande en color */}
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      fontSize: "2rem", 
                      color: card.iconColor,
                      lineHeight: 1.2
                    }}
                  >
                    {card.count}
                  </Typography>
                </Box>
                {/* Icono a la derecha en el mismo color */}
                <Box sx={{ color: card.iconColor, display: "flex", alignItems: "center" }}>
                  {card.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Main Content - Statistics Cards */}
      <Box sx={{ display: "flex", gap: 1.5, width: "100%", flexWrap: { xs: "wrap", md: "nowrap" } }}>
        {/* Left Column - Postulaciones Statistics */}
        <Box sx={{ flex: "1 1 0", minWidth: 0, display: "flex", width: { xs: "100%", md: "50%" } }}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: "white", width: "100%", display: "flex", flexDirection: "column", minHeight: "100%" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Estadísticas de Postulaciones
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="daily">Diario</MenuItem>
                    <MenuItem value="weekly">Semanal</MenuItem>
                    <MenuItem value="monthly">Mensual</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Progress Bars */}
              <Stack spacing={2.5} sx={{ mb: 3 }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      Aprobadas
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {postulacionStats.aprobadas}/{postulacionStats.total || 1}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: "#10b981",
                      borderRadius: 1,
                      width: `${postulacionStats.total > 0 ? (postulacionStats.aprobadas / postulacionStats.total) * 100 : 0}%`,
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      En proceso
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {postulacionStats.enProceso}/{postulacionStats.total || 1}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: "#3b82f6",
                      borderRadius: 1,
                      width: `${postulacionStats.total > 0 ? (postulacionStats.enProceso / postulacionStats.total) * 100 : 0}%`,
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      Pendientes
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {postulacionStats.pendientes}/{postulacionStats.total || 1}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: "#f59e0b",
                      borderRadius: 1,
                      width: `${postulacionStats.total > 0 ? (postulacionStats.pendientes / postulacionStats.total) * 100 : 0}%`,
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      Rechazadas
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {postulacionStats.rechazadas}/{postulacionStats.total || 1}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: "#ef4444",
                      borderRadius: 1,
                      width: `${postulacionStats.total > 0 ? (postulacionStats.rechazadas / postulacionStats.total) * 100 : 0}%`,
                    }}
                  />
                </Box>
              </Stack>

              {/* Donut Chart Representation */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  mx: "auto",
                  mb: 2,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    border: "20px solid #e5e7eb",
                    borderTopColor: postulacionStats.total > 0 && postulacionStats.aprobadas > 0 ? "#10b981" : "#e5e7eb",
                    borderRightColor: postulacionStats.total > 0 && postulacionStats.enProceso > 0 ? "#3b82f6" : "#e5e7eb",
                    borderBottomColor: postulacionStats.total > 0 && postulacionStats.pendientes > 0 ? "#f59e0b" : "#e5e7eb",
                    borderLeftColor: postulacionStats.total > 0 && postulacionStats.rechazadas > 0 ? "#ef4444" : "#e5e7eb",
                    transform: "rotate(-45deg)",
                  }}
                />
                <Box sx={{ position: "absolute", textAlign: "center" }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {postulacionStats.total}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Total
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                Postulaciones registradas
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Task Statistics */}
        <Box sx={{ flex: "1 1 0", minWidth: 0, display: "flex", width: { xs: "100%", md: "50%" } }}>
          <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: "white", width: "100%", display: "flex", flexDirection: "column", minHeight: "100%" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Estadísticas de Tareas
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="daily">Diario</MenuItem>
                    <MenuItem value="weekly">Semanal</MenuItem>
                    <MenuItem value="monthly">Mensual</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Progress Bars */}
              <Stack spacing={2.5} sx={{ mb: 3 }}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      Completadas
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {taskStats.completed.value}/{taskStats.completed.total}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: taskStats.completed.color,
                      borderRadius: 1,
                      width: `${(taskStats.completed.value / taskStats.completed.total) * 100}%`,
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      En progreso
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {taskStats.inProgress.value}/{taskStats.inProgress.total}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: taskStats.inProgress.color,
                      borderRadius: 1,
                      width: `${(taskStats.inProgress.value / taskStats.inProgress.total) * 100}%`,
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                      No iniciadas
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {taskStats.notStarted.value}/{taskStats.notStarted.total}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      height: 24,
                      bgcolor: taskStats.notStarted.color,
                      borderRadius: 1,
                      width: `${(taskStats.notStarted.value / taskStats.notStarted.total) * 100}%`,
                    }}
                  />
                </Box>
              </Stack>

              {/* Donut Chart Representation with Segmented Colors */}
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  mx: "auto",
                  mb: 2,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="200" height="200" style={{ position: "absolute" }}>
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  {/* Segmented circles with individual colors */}
                  {(() => {
                    const total = taskStats.completed.total;
                    const completed = taskStats.completed.value;
                    const inProgress = taskStats.inProgress.value;
                    const notStarted = taskStats.notStarted.value;
                    const radius = 80;
                    const circumference = 2 * Math.PI * radius;
                    const centerX = 100;
                    const centerY = 100;
                    
                    // Calculate percentages
                    const completedPercent = completed / total;
                    const inProgressPercent = inProgress / total;
                    const notStartedPercent = notStarted / total;
                    
                    let currentOffset = 0;
                    
                    return (
                      <>
                        {/* Completed segment (Verde) */}
                        {completed > 0 && (
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - completedPercent)}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${centerX} ${centerY})`}
                          />
                        )}
                        {/* In Progress segment (Azul) */}
                        {inProgress > 0 && (
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - inProgressPercent)}
                            strokeLinecap="round"
                            transform={`rotate(${-90 + completedPercent * 360} ${centerX} ${centerY})`}
                          />
                        )}
                        {/* Not Started segment (Morado) */}
                        {notStarted > 0 && (
                          <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="20"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - notStartedPercent)}
                            strokeLinecap="round"
                            transform={`rotate(${-90 + (completedPercent + inProgressPercent) * 360} ${centerX} ${centerY})`}
                          />
                        )}
                      </>
                    );
                  })()}
                </svg>
                <Box sx={{ position: "relative", textAlign: "center", zIndex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {taskStats.completed.value + taskStats.inProgress.value + taskStats.notStarted.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    Total
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                Tiempo total: {totalHours}
              </Typography>
            </CardContent>
          </Card>
        </Box>

      </Box>
    </Box>
  );
}
