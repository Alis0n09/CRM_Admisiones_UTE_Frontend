import { Box, Card, CardContent, Typography } from "@mui/material";
import School from "@mui/icons-material/School";
import Description from "@mui/icons-material/Description";
import Assignment from "@mui/icons-material/Assignment";
import { useEffect, useState } from "react";
import * as postulacionService from "../../services/postulacion.service";
import * as docService from "../../services/documentoPostulacion.service";
import * as tareaService from "../../services/tarea.service";

function toNum(r: any): number {
  if (Array.isArray(r)) return r.length;
  return r?.items?.length ?? r?.meta?.totalItems ?? 0;
}

export default function AspiranteDashboard() {
  const [counts, setCounts] = useState({ postulaciones: 0, documentos: 0, tareas: 0 });

  const loadCounts = () => {
    Promise.all([
      postulacionService.getPostulaciones({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
      docService.getDocumentosPostulacion().catch(() => []),
      tareaService.getTareas({ limit: 1 }).catch(() => ({ meta: { totalItems: 0 } })),
    ]).then(([p, d, t]) => {
      setCounts({
        postulaciones: (p as any)?.meta?.totalItems ?? (Array.isArray(p) ? (p as any).length : toNum(p)),
        documentos: Array.isArray(d) ? d.length : toNum(d),
        tareas: (t as any)?.meta?.totalItems ?? toNum(t),
      });
    });
  };

  useEffect(() => {
    loadCounts();

    // Escuchar eventos de actualización de documentos para actualizar contadores automáticamente
    const handleDocumentosUpdated = () => {
      console.log("📊 Dashboard: Evento de documentos recibido - Actualizando contadores...");
      loadCounts();
    };

    window.addEventListener("documentosUpdated", handleDocumentosUpdated);

    return () => {
      window.removeEventListener("documentosUpdated", handleDocumentosUpdated);
    };
  }, []);

  const cards = [
    { title: "Mis postulaciones", value: counts.postulaciones, icon: <School fontSize="large" />, color: "#10b981" },
    { title: "Mis documentos", value: counts.documentos, icon: <Description fontSize="large" />, color: "#f59e0b" },
    { title: "Mis tareas", value: counts.tareas, icon: <Assignment fontSize="large" />, color: "#5b5bf7" },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        <span style={{ color: "#10b981" }}>—</span> Mi espacio
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Resumen de tus postulaciones y documentos
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
