import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as s from "../../services/beca.service";
import type { Beca } from "../../services/beca.service";

const cols: Column<Beca>[] = [
  { id: "nombre_beca", label: "Nombre", minWidth: 180 },
  { id: "tipo_beca", label: "Tipo", minWidth: 120 },
  { id: "porcentaje_cobertura", label: "% Cobertura", minWidth: 110 },
  { id: "descripcion", label: "Descripción", minWidth: 180 },
  { id: "estado", label: "Estado", minWidth: 90 },
];

export default function AspiranteBecasPage() {
  const [items, setItems] = useState<Beca[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    s.getBecas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  return (
    <DataTable title="Becas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
      onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
      getId={(r) => r.id_beca} />
  );
}
