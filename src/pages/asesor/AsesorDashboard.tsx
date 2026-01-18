import { Box, Card, CardContent, Typography } from "@mui/material";
import People from "@mui/icons-material/People";
import Assignment from "@mui/icons-material/Assignment";
import School from "@mui/icons-material/School";
import { useEffect, useState } from "react";
import * as clienteService from "../../services/cliente.service";
import * as tareaService from "../../services/tarea.service";
import * as postulacionService from "../../services/postulacion.service";

function toItems(res: any): number {
  if (Array.isArray(res)) return res.length;
  return res?.items?.length ?? res?.meta?.totalItems ?? 0;
}

export default function AsesorDashboard() {
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
    { title: "Clientes", value: counts.clientes, icon: <People fontSize="large" />, color: "#5b5bf7" },
    { title: "Mis tareas", value: counts.tareas, icon: <Assignment fontSize="large" />, color: "#10b981" },
    { title: "Postulaciones", value: counts.postulaciones, icon: <School fontSize="large" />, color: "#f59e0b" },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        <span style={{ color: "#0ea5e9" }}>—</span> Panel de asesor
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Resumen de tu gestión en el CRM
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
        {cards.map((c) => (
          <Card key={c.title} sx={{ borderRadius: 2, boxShadow: 2, borderLeft: `4px solid ${c.color}` }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" variant="body2">{c.title}</Typography>
                <Typography variant="h4" fontWeight={700}>{c.value}</Typography>
              </Box>
              <Box sx={{ color: c.color }}>{c.icon}</Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
