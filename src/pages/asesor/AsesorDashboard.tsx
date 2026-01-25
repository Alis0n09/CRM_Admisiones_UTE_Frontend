import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as clienteService from "../../services/cliente.service";
import * as tareaService from "../../services/tarea.service";
import * as postulacionService from "../../services/postulacion.service";

function toItems(res: any): number {
  if (Array.isArray(res)) return res.length;
  return res?.items?.length ?? res?.meta?.totalItems ?? 0;
}

export default function AsesorDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ clientes: 0, tareas: 0, postulaciones: 0 });

  useEffect(() => {
    Promise.all([
      clienteService.getClientes({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      tareaService.getTareas({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      postulacionService.getPostulaciones({ limit: 1 }).catch(() => ({ items: [], meta: { totalItems: 0 } })),
    ]).then(([c, t, p]) => {
      setCounts({
        clientes: (c as any)?.meta?.totalItems ?? toItems(c),
        tareas: (t as any)?.meta?.totalItems ?? toItems(t),
        postulaciones: (p as any)?.meta?.totalItems ?? (Array.isArray(p) ? (p as any).length : toItems(p)),
      });
    });
  }, []);

  const cards = [
    {
      title: "Clientes",
      value: counts.clientes,
      icon: <People sx={{ fontSize: 24 }} />,
      bgColor: "#3b82f6",
      color: "white",
      route: "/asesor/clientes",
    },
    {
      title: "Mis tareas",
      value: counts.tareas,
      icon: <Assignment sx={{ fontSize: 24 }} />,
      bgColor: "#f5f5f5",
      color: "#1e293b",
      route: "/asesor/tareas",
    },
    {
      title: "Postulaciones",
      value: counts.postulaciones,
      icon: <School sx={{ fontSize: 24 }} />,
      bgColor: "#f5f5f5",
      color: "#1e293b",
      route: "/asesor/postulaciones",
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: "#1e293b" }}>
        Dashboard
      </Typography>

      {/* Navigation Cards */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "nowrap" }}>
        {cards.map((card, index) => (
          <Card
            key={index}
            onClick={() => navigate(card.route)}
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              borderRadius: 2,
              bgcolor: card.bgColor,
              color: card.color,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                {card.icon}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem", lineHeight: 1.2 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.9, display: "block" }}>
                    {card.value} Registros
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
