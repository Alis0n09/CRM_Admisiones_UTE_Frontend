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
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
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
  onEdit,
  onDelete,
  onView,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  getId,
}: DataTableProps<T>) {
  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>{title}</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {onSearchChange && (
            <TextField size="small" placeholder={searchPlaceholder} value={search ?? ""} onChange={(e) => onSearchChange(e.target.value)} sx={{ minWidth: 200 }} />
          )}
          {onAdd && (
            <Button variant="contained" startIcon={<Add />} onClick={onAdd} sx={{ textTransform: "none", bgcolor: "#5b5bf7", "&:hover": { bgcolor: "#4a4ae6" } }}>
              Nuevo
            </Button>
          )}
        </Box>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 3, boxShadow: 3, border: "1px solid #e5e7eb" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell 
                    key={String(col.id)} 
                    sx={{ 
                      fontWeight: 700, 
                      minWidth: col.minWidth,
                      bgcolor: "#f8fafc",
                      color: "#1e293b",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "2px solid #e2e8f0"
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                {(onEdit || onDelete || onView) && (
                  <TableCell sx={{ 
                    fontWeight: 700, 
                    width: 120,
                    bgcolor: "#f8fafc",
                    color: "#1e293b",
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "2px solid #e2e8f0"
                  }}>
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow 
                    key={getId(row)} 
                    hover
                    sx={{
                      "&:nth-of-type(even)": { bgcolor: "#f9fafb" },
                      "&:hover": { bgcolor: "#f3f4f6", transform: "scale(1.01)", transition: "all 0.2s" },
                      transition: "all 0.2s",
                      borderLeft: idx % 2 === 0 ? "3px solid transparent" : "3px solid #e5e7eb"
                    }}
                  >
                    {columns.map((col) => (
                      <TableCell 
                        key={String(col.id)}
                        sx={{
                          fontSize: "0.875rem",
                          color: "#374151",
                          py: 1.5
                        }}
                      >
                        {col.format ? col.format((row as any)[col.id], row) : String((row as any)[col.id] ?? "")}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {onView && (
                            <IconButton 
                              size="small" 
                              onClick={() => onView(row)}
                              sx={{
                                color: "#8b5cf6",
                                "&:hover": { bgcolor: "#ede9fe", color: "#7c3aed" }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          )}
                          {onEdit && (
                            <IconButton 
                              size="small" 
                              onClick={() => onEdit(row)}
                              sx={{
                                color: "#3b82f6",
                                "&:hover": { bgcolor: "#dbeafe", color: "#2563eb" }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => onDelete(row)}
                              sx={{
                                "&:hover": { bgcolor: "#fee2e2" }
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
