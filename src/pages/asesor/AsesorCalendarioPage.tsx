import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Edit,
  Delete,
} from "@mui/icons-material";

interface CalendarNote {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  color: string;
  time?: string;
}

const COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Morado", value: "#8b5cf6" },
  { name: "Naranja", value: "#f59e0b" },
  { name: "Rojo", value: "#ef4444" },
];

const DAYS_ABBR = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function AsesorCalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<CalendarNote | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    color: COLORS[0].value,
    time: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // getDay() devuelve 0=domingo, 1=lunes, etc. Necesitamos ajustar para que domingo sea el primer día
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Días del mes anterior (domingo = 0, así que agregamos espacios vacíos)
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    // Completar hasta 42 celdas (6 semanas) para mantener la cuadrícula completa
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(null);
    }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const getNotesForDate = (day: number | null): CalendarNote[] => {
    if (day === null) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return notes.filter((note) => note.date === dateStr);
  };

  const handleDateClick = (day: number | null) => {
    if (day === null) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setSelectedNote(null);
    setForm({ title: "", description: "", color: COLORS[0].value, time: "" });
    setOpenDialog(true);
  };

  const handleNoteClick = (note: CalendarNote) => {
    setSelectedNote(note);
    setSelectedDate(note.date);
    setForm({
      title: note.title,
      description: note.description,
      color: note.color,
      time: note.time || "",
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (selectedNote) {
      setNotes(
        notes.map((n) =>
          n.id === selectedNote.id
            ? { ...n, ...form, date: selectedDate }
            : n
        )
      );
    } else {
      const newNote: CalendarNote = {
        id: Date.now().toString(),
        date: selectedDate,
        title: form.title,
        description: form.description,
        color: form.color,
        time: form.time || undefined,
      };
      setNotes([...notes, newNote]);
    }

    setOpenDialog(false);
    setForm({ title: "", description: "", color: COLORS[0].value, time: "" });
    setSelectedNote(null);
  };

  const handleDelete = () => {
    if (selectedNote) {
      setNotes(notes.filter((n) => n.id !== selectedNote.id));
      setOpenDialog(false);
      setSelectedNote(null);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number | null) => {
    if (day === null) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Calendario
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            const today = new Date();
            handleDateClick(today.getDate());
          }}
          sx={{
            background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #059669 0%, #2563eb 50%, #7c3aed 100%)",
            },
          }}
        >
          Nueva Nota
        </Button>
      </Box>

      <Card 
        sx={{ 
          borderRadius: 2, 
          boxShadow: 2, 
          overflow: "hidden",
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.03) 50%, rgba(139, 92, 246, 0.03) 100%)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header con mes y año */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: "3.5rem",
                background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 0.5,
                letterSpacing: "2px",
                textTransform: "capitalize",
                lineHeight: 1.2,
              }}
            >
              {MONTHS[month]}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 300,
                color: "#64748b",
                letterSpacing: "1px",
              }}
            >
              {year}
            </Typography>
          </Box>

          {/* Controles de navegación */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <IconButton 
              onClick={goToPreviousMonth}
              sx={{
                color: "#64748b",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <Button 
              variant="outlined" 
              onClick={goToToday}
              sx={{
                borderColor: "#e5e7eb",
                color: "#64748b",
                "&:hover": {
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  bgcolor: "rgba(59, 130, 246, 0.05)",
                },
              }}
            >
              Hoy
            </Button>
            <IconButton
              onClick={goToNextMonth}
              sx={{
                color: "#64748b",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                },
              }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Días de la semana */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
            {DAYS_ABBR.map((day) => (
              <Box
                key={day}
                sx={{
                  flex: 1,
                  py: 1.5,
                  textAlign: "center",
                  fontWeight: 700,
                  color: "#374151",
                  fontSize: "0.75rem",
                  letterSpacing: "1px",
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Calendario Grid */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {calendarDays.map((day, idx) => {
              const dayNotes = getNotesForDate(day);
              const today = isToday(day);

              return (
                <Box
                  key={idx}
                  sx={{
                    flex: "0 0 calc(14.2857% - 0.36rem)",
                    width: "calc(14.2857% - 0.36rem)",
                  }}
                >
                  <Box
                    onClick={() => handleDateClick(day)}
                    sx={{
                      aspectRatio: "1",
                      minHeight: 110,
                      p: 1.2,
                      cursor: day ? "pointer" : "default",
                      border: today ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                      borderRadius: 2,
                      bgcolor: day ? (today ? "rgba(59, 130, 246, 0.08)" : "white") : "#fafafa",
                      position: "relative",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: today ? "0 2px 8px rgba(59, 130, 246, 0.15)" : "none",
                      "&:hover": day
                        ? {
                            bgcolor: today 
                              ? "rgba(59, 130, 246, 0.12)" 
                              : "rgba(16, 185, 129, 0.05)",
                            transform: "translateY(-2px)",
                            boxShadow: today 
                              ? "0 4px 12px rgba(59, 130, 246, 0.2)" 
                              : "0 4px 12px rgba(16, 185, 129, 0.15)",
                            borderColor: today ? "#3b82f6" : "#10b981",
                          }
                        : {},
                    }}
                  >
                    {day && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: today ? 700 : 500,
                            color: today ? "#3b82f6" : "#1f2937",
                            mb: 0.5,
                            fontSize: "0.875rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {day}
                        </Typography>
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.3, overflow: "hidden" }}>
                          {dayNotes.slice(0, 2).map((note) => (
                            <Chip
                              key={note.id}
                              label={note.title}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNoteClick(note);
                              }}
                              sx={{
                                bgcolor: note.color,
                                color: "white",
                                fontSize: "0.6rem",
                                height: 16,
                                fontWeight: 500,
                                cursor: "pointer",
                                "&:hover": { opacity: 0.85, transform: "scale(1.05)" },
                                maxWidth: "100%",
                                "& .MuiChip-label": {
                                  px: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                },
                              }}
                            />
                          ))}
                          {dayNotes.length > 2 && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: "#9ca3af",
                                fontSize: "0.6rem",
                                mt: 0.2,
                              }}
                            >
                              +{dayNotes.length - 2}
                            </Typography>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar nota */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "white",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.98) 100%)",
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "rgba(59, 130, 246, 0.05)",
            borderBottom: "1px solid #e5e7eb",
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
            {selectedNote ? "Editar Nota" : "Nueva Nota"}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : ""}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "white", pt: 3 }}>
          <TextField
            fullWidth
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Hora (opcional)"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Color:
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {COLORS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => setForm({ ...form, color: color.value })}
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                    bgcolor: color.value,
                    cursor: "pointer",
                    border:
                      form.color === color.value ? "3px solid #1e293b" : "2px solid #e5e7eb",
                    transition: "all 0.2s",
                    "&:hover": { transform: "scale(1.1)", boxShadow: 2 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: "rgba(248, 250, 252, 0.8)",
            borderTop: "1px solid #e5e7eb",
            px: 3,
            py: 2,
          }}
        >
          {selectedNote && (
            <Button 
              onClick={handleDelete} 
              color="error" 
              startIcon={<Delete />}
              sx={{
                fontWeight: 600,
              }}
            >
              Eliminar
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{
              fontWeight: 600,
              color: "#64748b",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!form.title.trim()}
            startIcon={selectedNote ? <Edit /> : <Add />}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #8b5cf6 100%)",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #2563eb 50%, #7c3aed 100%)",
                boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#e5e7eb",
                boxShadow: "none",
              },
            }}
          >
            {selectedNote ? "Guardar" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
