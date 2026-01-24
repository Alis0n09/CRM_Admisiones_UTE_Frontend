import { Box, Card, CardContent, Typography, LinearProgress, Button, Chip, Stack, Divider, CircularProgress, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as clienteService from "../../services/cliente.service";
import * as postulacionService from "../../services/postulacion.service";
import * as documentoService from "../../services/documentoPostulacion.service";
import type { Postulacion } from "../../services/postulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";
import type { Cliente } from "../../services/cliente.service";

interface StepData {
  label: string;
  date?: string;
  status: "completed" | "in-progress" | "pending";
  description?: string;
}

export default function ProcesoAdmisionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [postulacion, setPostulacion] = useState<Postulacion | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoPostulacion[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id_cliente) {
        setLoading(false);
        return;
      }

      try {
        // Cargar datos del cliente
        const clienteData = await clienteService.getCliente(user.id_cliente);
        setCliente(clienteData);

        // Cargar postulaciones del cliente
        const postulaciones = await postulacionService.getPostulaciones();
        const postulacionesList = Array.isArray(postulaciones) 
          ? postulaciones 
          : (postulaciones as any)?.items || [];
        
        // Obtener la postulación más reciente o activa
        const postulacionActiva = postulacionesList.find(
          (p: Postulacion) => p.id_cliente === user.id_cliente
        ) || postulacionesList[0];
        
        if (postulacionActiva) {
          setPostulacion(postulacionActiva);
          
          // Cargar documentos de la postulación
          const docs = await documentoService.getDocumentosPostulacion();
          const docsList = Array.isArray(docs) ? docs : [];
          const docsPostulacion = docsList.filter(
            (d: DocumentoPostulacion) => d.id_postulacion === postulacionActiva.id_postulacion
          );
          setDocumentos(docsPostulacion);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id_cliente]);

  // Documentos requeridos: combina los estándar con los que el asesor ha especificado
  const documentosRequeridos = useMemo(() => {
    if (!postulacion) {
      return [];
    }

    // Documentos requeridos estándar para cualquier postulación
    const requeridosEstandar = [
      "Cédula de identidad",
      "Certificado de notas",
      "Título de bachiller",
      "Foto tamaño carnet",
    ];

    // Obtener todos los tipos de documentos que existen para esta postulación
    // Estos son los que el asesor ha especificado como requeridos
    const tiposDocumentosExistentes = documentos
      .filter(d => d.id_postulacion === postulacion.id_postulacion)
      .map(d => d.tipo_documento);

    // Combinar documentos estándar con los especificados por el asesor
    // Si el asesor ya creó documentos, esos son los requeridos principales
    const todosTipos = tiposDocumentosExistentes.length > 0
      ? [...new Set([...tiposDocumentosExistentes, ...requeridosEstandar])]
      : requeridosEstandar;

    // Crear la lista de documentos requeridos con su estado
    return todosTipos.map(tipo => {
      const docExistente = documentos.find(
        d => d.id_postulacion === postulacion.id_postulacion && d.tipo_documento === tipo
      );
      
      return {
        tipo_documento: tipo,
        existe: !!docExistente,
        documento: docExistente || null,
        esRequeridoPorAsesor: tiposDocumentosExistentes.includes(tipo),
      };
    }).sort((a, b) => {
      // Priorizar documentos especificados por el asesor
      if (a.esRequeridoPorAsesor && !b.esRequeridoPorAsesor) return -1;
      if (!a.esRequeridoPorAsesor && b.esRequeridoPorAsesor) return 1;
      return 0;
    });
  }, [postulacion, documentos]);

  // Calcular pasos basados en el estado real
  const steps = useMemo<StepData[]>(() => {
    if (!postulacion) {
      return [
        { label: "Registro", status: "pending", description: "Pendiente" },
        { label: "Formulario de admisión", status: "pending", description: "Pendiente" },
        { label: "Documentos", status: "pending", description: "Pendiente" },
        { label: "Entrevista", status: "pending", description: "Pendiente" },
        { label: "Resultado", status: "pending", description: "Pendiente" },
      ];
    }

    const fechaPostulacion = postulacion.fecha_postulacion 
      ? new Date(postulacion.fecha_postulacion).toISOString().split("T")[0]
      : undefined;

    // Filtrar documentos de esta postulación específica
    const docsPostulacion = documentos.filter(
      (d) => d.id_postulacion === postulacion.id_postulacion
    );
    
    const documentosCompletados = docsPostulacion.filter(
      (d) => d.estado_documento === "Aprobado" || d.estado_documento === "Completado"
    ).length;
    
    // El total de documentos requeridos se basa en los documentos requeridos calculados
    const totalDocumentosRequeridos = documentosRequeridos.length || 4;
    const totalDocumentos = Math.max(docsPostulacion.length, totalDocumentosRequeridos);
    
    const documentosEnProgreso = docsPostulacion.some(
      (d) => d.estado_documento === "Pendiente" || d.estado_documento === "En revisión"
    ) || (docsPostulacion.length > 0 && documentosCompletados < totalDocumentosRequeridos);

    const estadoPostulacion = postulacion.estado_postulacion?.toLowerCase() || "";

    return [
      {
        label: "Registro",
        date: cliente?.fecha_registro 
          ? new Date(cliente.fecha_registro).toISOString().split("T")[0]
          : fechaPostulacion,
        status: cliente ? "completed" : "pending",
      },
      {
        label: "Formulario de admisión",
        date: fechaPostulacion,
        status: postulacion ? "completed" : "pending",
      },
      {
        label: "Documentos",
        status: documentosEnProgreso 
          ? "in-progress" 
          : totalDocumentos > 0 && documentosCompletados === totalDocumentos
          ? "completed"
          : "pending",
        description: documentosEnProgreso 
          ? "En progreso" 
          : totalDocumentos > 0 
          ? `${documentosCompletados}/${totalDocumentos} completados`
          : "Pendiente",
      },
      {
        label: "Entrevista",
        status: estadoPostulacion.includes("entrevista") || estadoPostulacion.includes("aprobado")
          ? "completed"
          : estadoPostulacion.includes("rechazado")
          ? "pending"
          : "pending",
        description: estadoPostulacion.includes("entrevista") ? "Programada" : "Pendiente",
      },
      {
        label: "Resultado",
        status: estadoPostulacion.includes("aprobado")
          ? "completed"
          : estadoPostulacion.includes("rechazado")
          ? "completed"
          : "pending",
        description: estadoPostulacion || "Pendiente",
      },
    ];
  }, [postulacion, cliente, documentos, documentosRequeridos]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 28 }} />;
      case "in-progress":
        return <AccessTimeIcon sx={{ color: "#3b82f6", fontSize: 28 }} />;
      default:
        return <ErrorOutlineIcon sx={{ color: "#9ca3af", fontSize: 28 }} />;
    }
  };

  const currentStep = steps.findIndex((s) => s.status === "in-progress");
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  const estadoActual = useMemo(() => {
    if (!postulacion) return "Sin postulación";
    const estado = postulacion.estado_postulacion || "En proceso";
    if (steps[2].status === "in-progress") return "Revisión de documentos";
    return estado;
  }, [postulacion, steps]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cliente) {
    return (
      <Alert severity="warning">
        No se encontró información del cliente. Por favor, completa tu perfil.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        <span style={{ color: "#3b82f6" }}>—</span> Mi Proceso de Admisión
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Revisa el estado de tu solicitud y completa los pasos pendientes
      </Typography>
      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", lg: "row" } }}>
        {/* Left Column - Main Content */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Progress Card */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
              Sigue el progreso de tu solicitud
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #7c3aed, #22c55e)",
                    borderRadius: 6,
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Estado de tu solicitud
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {estadoActual}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                  {Math.round(progress)}%
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Completado
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Paso {currentStep + 1} de {steps.length}
            </Typography>
          </CardContent>
        </Card>

        {/* Process Timeline Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
              Proceso de Admisión
            </Typography>

            <Box sx={{ position: "relative" }}>
              {steps.map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: index < steps.length - 1 ? 4 : 0,
                    position: "relative",
                  }}
                >
                  {/* Timeline Line */}
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 14,
                        top: 28,
                        width: 2,
                        height: "calc(100% + 16px)",
                        bgcolor: step.status === "completed" ? "#22c55e" : "#e5e7eb",
                      }}
                    />
                  )}

                  {/* Step Icon */}
                  <Box sx={{ mr: 2, mt: 0.5 }}>{getStepIcon(step.status)}</Box>

                  {/* Step Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {step.label}
                    </Typography>
                    {step.date && (
                      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                        {step.date}
                      </Typography>
                    )}
                    {step.description && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={step.description}
                          size="small"
                          sx={{
                            bgcolor:
                              step.status === "in-progress"
                                ? "#dbeafe"
                                : step.status === "completed"
                                ? "#dcfce7"
                                : "#f3f4f6",
                            color:
                              step.status === "in-progress"
                                ? "#3b82f6"
                                : step.status === "completed"
                                ? "#22c55e"
                                : "#6b7280",
                            fontWeight: 500,
                          }}
                        />
                        {step.status === "in-progress" && step.label === "Documentos" && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate("/aspirante/documentos")}
                            sx={{
                              ml: 2,
                              textTransform: "none",
                              bgcolor: "#3b82f6",
                              "&:hover": { bgcolor: "#2563eb" },
                            }}
                          >
                            Completar ahora
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
        </Box>

      {/* Right Column - Sidebar */}
      <Box sx={{ width: { xs: "100%", lg: 380 }, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Personal Information Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Información Personal
            </Typography>

            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                  Nombre completo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {cliente.nombres} {cliente.apellidos}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                  Programa
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {postulacion?.carrera?.nombre_carrera || "Sin programa asignado"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {cliente.correo || user?.email || "No especificado"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                  Teléfono
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {cliente.celular || cliente.telefono || "No especificado"}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                fullWidth
                onClick={() => navigate("/aspirante/perfil")}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  borderColor: "#7c3aed",
                  color: "#7c3aed",
                  "&:hover": {
                    borderColor: "#6d28d9",
                    bgcolor: "#f3e8ff",
                  },
                }}
              >
                Editar perfil
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Required Documents Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Documentos Requeridos
            </Typography>

            <Stack spacing={2}>
              {postulacion ? (
                documentosRequeridos.length > 0 ? (
                  documentosRequeridos.map((req, index) => {
                    const doc = req.documento;
                    const isCompleted = doc && (doc.estado_documento === "Aprobado" || doc.estado_documento === "Completado");
                    const isPending = !doc || doc.estado_documento === "Pendiente" || !doc.estado_documento;
                    const isRechazado = doc && doc.estado_documento === "Rechazado";
                    
                    return (
                      <Box
                        key={`${req.tipo_documento}-${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          bgcolor: isCompleted ? "#f0fdf4" : isRechazado ? "#fef2f2" : "#f9fafb",
                          borderRadius: 2,
                          border: isRechazado ? "1px solid #fecaca" : "1px solid transparent",
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: isCompleted 
                              ? "#dcfce7" 
                              : isRechazado 
                              ? "#fee2e2" 
                              : isPending 
                              ? "#fef3c7" 
                              : "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon sx={{ color: "#22c55e" }} />
                          ) : isRechazado ? (
                            <ErrorOutlineIcon sx={{ color: "#ef4444" }} />
                          ) : (
                            <AccessTimeIcon sx={{ color: isPending ? "#f59e0b" : "#3b82f6" }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {req.tipo_documento}
                          </Typography>
                          {doc ? (
                            <>
                              <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                                {doc.nombre_archivo || "Sin archivo"}
                              </Typography>
                              {doc.estado_documento && (
                                <Chip
                                  label={doc.estado_documento}
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    height: 20,
                                    fontSize: "0.7rem",
                                    bgcolor: isCompleted 
                                      ? "#dcfce7" 
                                      : isRechazado 
                                      ? "#fee2e2" 
                                      : "#dbeafe",
                                    color: isCompleted 
                                      ? "#22c55e" 
                                      : isRechazado 
                                      ? "#ef4444" 
                                      : "#3b82f6",
                                  }}
                                />
                              )}
                              {doc.observaciones && (
                                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, fontStyle: "italic" }}>
                                  {doc.observaciones}
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                              Pendiente de subir
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                    No hay documentos requeridos especificados aún
                  </Typography>
                )
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 2 }}>
                  Completa tu postulación para ver los documentos requeridos
                </Typography>
              )}
              
              {postulacion && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => navigate("/aspirante/documentos")}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    borderColor: "#7c3aed",
                    color: "#7c3aed",
                    "&:hover": {
                      borderColor: "#6d28d9",
                      bgcolor: "#f3e8ff",
                    },
                  }}
                >
                  Gestionar documentos
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
      </Box>
    </Box>
  );
}
