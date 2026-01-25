import { Avatar, Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CallIcon from "@mui/icons-material/Call";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as clienteService from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";

function toItems(res: any): number {
  if (Array.isArray(res)) return res.length;
  return res?.items?.length ?? res?.meta?.totalItems ?? 0;
}

function initialsFrom(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
}

function isToday(isoDate?: string) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export default function AsesorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientesTotal, setClientesTotal] = useState(0);
  const [clientesPreview, setClientesPreview] = useState<clienteService.Cliente[]>([]);
  const [postulaciones, setPostulaciones] = useState<postulacionService.Postulacion[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // Traemos algunos clientes para el listado del dashboard + total desde meta
      clienteService.getClientes({ page: 1, limit: 25 }).catch(() => ({ items: [], meta: { totalItems: 0 } })),
      postulacionService.getPostulaciones({ limit: 50 }).catch(() => ({ items: [], meta: { totalItems: 0 } })),
    ])
      .then(([c, p]) => {
        const clientesItems = (c as any)?.items ?? (Array.isArray(c) ? c : []);
        setClientesPreview(clientesItems);
        setClientesTotal((c as any)?.meta?.totalItems ?? clientesItems.length ?? toItems(c));
        const list = Array.isArray(p) ? p : ((p as any)?.items ?? []);
        setPostulaciones(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const estado = (p?: string) => String(p || "").toLowerCase();
    const pendientes = postulaciones.filter((p) => estado(p.estado_postulacion).includes("pend")).length;
    const completados = postulaciones.filter((p) => {
      const e = estado(p.estado_postulacion);
      return e.includes("complet") || e.includes("aprob") || e.includes("matric");
    }).length;
    const entrevistasHoyReal = postulaciones.filter((p) => isToday(p.fecha_postulacion)).length;
    return {
      asignados: clientesTotal,
      pendientes,
      entrevistasHoy: entrevistasHoyReal,
      completados,
    };
  }, [clientesTotal, postulaciones]);

  const aspirantes = useMemo(() => {
    // Para que SIEMPRE liste aspirantes, usamos la lista de clientes y (si existe) enriquecemos con postulaciones
    const byCliente = new Map<string, postulacionService.Postulacion[]>();
    for (const p of postulaciones) {
      const arr = byCliente.get(p.id_cliente) ?? [];
      arr.push(p);
      byCliente.set(p.id_cliente, arr);
    }

    const list = (clientesPreview || []).slice(0, 4).map((c) => {
      const nombre = `${c.nombres || ""} ${c.apellidos || ""}`.trim() || "Aspirante";
      const posts = byCliente.get(c.id_cliente) ?? [];
      const last = posts[0];
      const carrera =
        last?.carrera?.nombre_carrera ||
        (last?.id_carrera ? `Carrera ${String(last.id_carrera).slice(0, 6)}` : "—");
      const estado = String(last?.estado_postulacion || c.estado || "En proceso").trim();
      return { id_cliente: c.id_cliente, nombre, carrera, estado };
    });

    // Si por alguna razón no hay clientesPreview pero sí postulaciones (fallback)
    if (list.length > 0) return list;

    const alt = postulaciones
      .map((p) => {
        const fullName = `${p.cliente?.nombres || ""} ${p.cliente?.apellidos || ""}`.trim();
        return {
          id_cliente: p.id_cliente,
          nombre: fullName || "Aspirante",
          carrera: p.carrera?.nombre_carrera || (p.id_carrera ? `Carrera ${String(p.id_carrera).slice(0, 6)}` : "—"),
          estado: String(p.estado_postulacion || "En proceso"),
        };
      })
      .filter((x) => x.id_cliente);

    const seen = new Set<string>();
    const unique: typeof alt = [];
    for (const it of alt) {
      if (seen.has(it.id_cliente)) continue;
      seen.add(it.id_cliente);
      unique.push(it);
    }
    return unique.slice(0, 4);
  }, [clientesPreview, postulaciones]);

  const entrevistas = useMemo(() => {
    const todayOnes = postulaciones
      .filter((p) => isToday(p.fecha_postulacion))
      .slice(0, 3)
      .map((p, idx) => {
        const name = `${p.cliente?.nombres || ""} ${p.cliente?.apellidos || ""}`.trim() || "Aspirante";
        return { id: p.id_postulacion, nombre: name, hora: idx === 0 ? "10:00 AM" : idx === 1 ? "02:00 PM" : "04:30 PM" };
      });

    if (todayOnes.length > 0) return todayOnes;

    // Fallback visual (si el backend no trae fecha/hoy)
    return aspirantes.slice(0, 3).map((a, idx) => ({
      id: a.id_cliente,
      nombre: a.nombre,
      hora: idx === 0 ? "10:00 AM" : idx === 1 ? "02:00 PM" : "04:30 PM",
    }));
  }, [aspirantes, postulaciones]);

  const priorityChip = (idx: number) => {
    if (idx % 3 === 0) return { label: "alta", sx: { bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: 700 } };
    if (idx % 3 === 1) return { label: "media", sx: { bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 } };
    return { label: "baja", sx: { bgcolor: "#dcfce7", color: "#166534", fontWeight: 700 } };
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      {/* Header atractivo */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 2,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
          background: "linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(139,92,246,0.92) 55%, rgba(16,185,129,0.90) 100%)",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={900} sx={{ color: "white" }}>
                Panel de Asesor
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", mt: 0.25 }}>
                Gestiona tus aspirantes y evalúa solicitudes
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate("/asesor/clientes")}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 900,
                  bgcolor: "rgba(255,255,255,0.18)",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)", boxShadow: "none" },
                }}
              >
                Ver aspirantes
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate("/asesor/postulaciones")}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 900,
                  bgcolor: "rgba(255,255,255,0.18)",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.28)", boxShadow: "none" },
                }}
              >
                Revisar solicitudes
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Metric cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2.5,
        }}
      >
        {[
          {
            title: "Aspirantes Asignados",
            value: metrics.asignados,
            icon: <PeopleIcon sx={{ color: "white", fontSize: 20 }} />,
            iconBg: "#2563eb",
            onClick: () => navigate("/asesor/clientes"),
          },
          {
            title: "Pendientes de Revisar",
            value: metrics.pendientes,
            icon: <PendingActionsIcon sx={{ color: "white", fontSize: 20 }} />,
            iconBg: "#7c3aed",
            onClick: () => navigate("/asesor/postulaciones"),
          },
          {
            title: "Entrevistas Hoy",
            value: metrics.entrevistasHoy || entrevistas.length,
            icon: <CalendarMonthIcon sx={{ color: "white", fontSize: 20 }} />,
            iconBg: "#16a34a",
            onClick: () => navigate("/asesor/calendario"),
          },
          {
            title: "Completados",
            value: metrics.completados,
            icon: <CheckCircleIcon sx={{ color: "white", fontSize: 20 }} />,
            iconBg: "#4f46e5",
            onClick: () => navigate("/asesor/postulaciones"),
          },
        ].map((m) => (
          <Card
            key={m.title}
            onClick={m.onClick}
            sx={{
              borderRadius: 3,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: "#334155", fontWeight: 700 }}>
                    {m.title}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 900, color: "#0f172a" }}>
                    {loading ? "—" : m.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: m.iconBg,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {m.icon}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Bottom panels */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
        }}
      >
        {/* Mis Aspirantes */}
        <Card sx={{ borderRadius: 3, boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)" }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#0f172a" }}>
                Mis Aspirantes
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate("/asesor/clientes")}
                sx={{ textTransform: "none", borderRadius: 2 }}
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
              >
                Ver todos
              </Button>
            </Stack>

            <Stack spacing={1}>
              {aspirantes.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {loading ? "Cargando..." : "No hay aspirantes para mostrar todavía."}
                </Typography>
              ) : (
                aspirantes.map((a, idx) => {
                  const chip = priorityChip(idx);
                  return (
                    <Box
                      key={a.id_cliente}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 1,
                        alignItems: "center",
                        py: 1.25,
                        px: 1.25,
                        borderRadius: 3,
                        bgcolor: "rgba(248,250,252,0.9)",
                        border: "1px solid rgba(226,232,240,0.9)",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          bgcolor: "white",
                          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar sx={{ width: 38, height: 38, bgcolor: "#6366f1", fontWeight: 900, fontSize: 14 }}>
                          {initialsFrom(a.nombre)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: "#0f172a" }} noWrap>
                            {a.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }} noWrap>
                            {a.carrera}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: "#334155" }}>
                            {String(a.estado).toLowerCase().includes("entre")
                              ? "Entrevista programada"
                              : String(a.estado).toLowerCase().includes("doc")
                                ? "Documentos enviados"
                                : String(a.estado).toLowerCase().includes("pend")
                                  ? "En evaluación"
                                  : "En proceso"}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label={chip.label} sx={{ height: 22, ...chip.sx }} />
                        <Button
                          size="small"
                          onClick={() => navigate(`/asesor/clientes?search=${encodeURIComponent(a.nombre)}`)}
                          sx={{ textTransform: "none", fontWeight: 900 }}
                        >
                          Revisar
                        </Button>
                      </Stack>
                    </Box>
                  );
                })
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Entrevistas de Hoy */}
        <Card sx={{ borderRadius: 3, boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#0f172a", mb: 1.5 }}>
              Entrevistas de Hoy
            </Typography>

            <Stack spacing={1.25}>
              {entrevistas.length === 0 ? (
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {loading ? "Cargando..." : "No hay entrevistas programadas para hoy."}
                </Typography>
              ) : (
                entrevistas.map((e) => (
                  <Card
                    key={e.id}
                    variant="outlined"
                    sx={{ borderRadius: 2, borderColor: "#e2e8f0", bgcolor: "white" }}
                  >
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: "#64748b", fontSize: 12, fontWeight: 900 }}>
                          {initialsFrom(e.nombre)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={800} sx={{ color: "#0f172a" }} noWrap>
                            {e.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            {e.hora}
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        fullWidth
                        size="small"
                        startIcon={<CallIcon />}
                        onClick={() => navigate("/asesor/calendario")}
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          fontWeight: 800,
                          color: "white",
                          background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                          "&:hover": {
                            background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
                          },
                        }}
                      >
                        Iniciar llamada
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
