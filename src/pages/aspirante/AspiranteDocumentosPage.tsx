import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as docService from "../../services/documentoPostulacion.service";
import type { DocumentoPostulacion } from "../../services/documentoPostulacion.service";

const cols: Column<DocumentoPostulacion>[] = [
  { id: "tipo_documento", label: "Tipo", minWidth: 120 },
  { id: "nombre_archivo", label: "Archivo", minWidth: 180 },
  { id: "estado_documento", label: "Estado", minWidth: 100 },
];

export default function AspiranteDocumentosPage() {
  const [items, setItems] = useState<DocumentoPostulacion[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    docService.getDocumentosPostulacion().then((r) => setItems(Array.isArray(r) ? r : [])).catch(() => setItems([]));
  }, []);

  useEffect(() => load(), [load]);

  const paginated = items.slice((page - 1) * limit, page * limit);
  return (
    <DataTable title="Mis documentos" columns={cols} rows={paginated} total={items.length} page={page} rowsPerPage={limit}
      onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
      getId={(r) => r.id_documento} />
  );
}
