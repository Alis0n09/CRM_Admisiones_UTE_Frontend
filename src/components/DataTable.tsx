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
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={String(col.id)} sx={{ fontWeight: 700, minWidth: col.minWidth }}>{col.label}</TableCell>
                ))}
                {(onEdit || onDelete) && <TableCell sx={{ fontWeight: 700, width: 100 }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getId(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={String(col.id)}>
                      {col.format ? col.format((row as any)[col.id], row) : String((row as any)[col.id] ?? "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      {onEdit && <IconButton size="small" onClick={() => onEdit(row)}><Edit fontSize="small" /></IconButton>}
                      {onDelete && <IconButton size="small" color="error" onClick={() => onDelete(row)}><Delete fontSize="small" /></IconButton>}
                    </TableCell>
                  )}
                </TableRow>
              ))}
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
