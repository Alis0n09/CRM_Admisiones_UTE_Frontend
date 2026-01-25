import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import Visibility from "@mui/icons-material/Visibility";

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  format?: (v: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { [k: string]: any }> {
  title: string;
  columns: Column<T>[];
  rows: T[];
  total?: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
  onAdd?: () => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  getId: (row: T) => string;
}

export default function DataTable<T extends { [k: string]: any }>({
  title,
  columns,
  rows,
  total = rows.length,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onAdd,
  onView,
  onEdit,
  onDelete,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  getId,
}: DataTableProps<T>) {
  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: "#1e293b" }}>{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {onSearchChange && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{
                minWidth: 200,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f5f5f5",
                  "& fieldset": {
                    borderColor: "#e5e7eb",
                  },
                },
              }}
            />
          )}
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              sx={{
                textTransform: "none",
                bgcolor: "#3b82f6",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              Nuevo
            </Button>
          )}
        </Box>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", bgcolor: "white", pointerEvents: "auto" }}>
        <TableContainer sx={{ maxHeight: 520, pointerEvents: "auto" }}>
          <Table stickyHeader size="small" sx={{ pointerEvents: "auto" }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={String(col.id)} sx={{ fontWeight: 700, minWidth: col.minWidth, color: "white", bgcolor: "#64748b", fontSize: "0.875rem" }}>{col.label}</TableCell>
                ))}
                {(onView || onEdit || onDelete) && <TableCell sx={{ fontWeight: 700, width: onView && onEdit ? 140 : 100, color: "white", bgcolor: "#64748b", fontSize: "0.875rem" }}>ACCIONES</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow 
                    key={getId(row)} 
                    hover 
                    sx={{ "&:nth-of-type(even)": { bgcolor: "#f9fafb" } }}
                  >
                    {columns.map((col) => (
                      <TableCell key={String(col.id)} sx={{ fontSize: "0.875rem" }}>
                        {col.format ? col.format((row as any)[col.id], row) : String((row as any)[col.id] ?? "")}
                      </TableCell>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <TableCell 
                        sx={{ 
                          position: "relative",
                          pointerEvents: "auto",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            alignItems: "center",
                            justifyContent: "flex-start",
                            pointerEvents: "auto",
                          }}
                        >
                          {onView && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                console.log("View clicked for row:", row);
                                console.log("onView function:", onView);
                                try {
                                  onView(row);
                                  console.log("onView executed successfully");
                                } catch (error) {
                                  console.error("Error executing onView:", error);
                                }
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                              }}
                              sx={{
                                color: "#8b5cf6",
                                cursor: "pointer",
                                pointerEvents: "auto",
                                "&:hover": { bgcolor: "rgba(139, 92, 246, 0.1)" },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          {onEdit && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                              }}
                              sx={{
                                color: "#3b82f6",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                              sx={{
                                color: "#ef4444",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={Math.max(0, page - 1)}
          onPageChange={(_, p) => onPageChange(p + 1)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10) || 10)}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas:"
        />
      </Paper>
    </Box>
  );
}
