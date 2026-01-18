import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as tareaService from "../../services/tarea.service";
import type { TareaCrm } from "../../services/tarea.service";

const cols: Column<TareaCrm>[] = [
  { id: "descripcion", label: "Descripción", minWidth: 200 },
  { id: "fecha_asignacion", label: "Asignación", minWidth: 110 },
  { id: "fecha_vencimiento", label: "Vencimiento", minWidth: 110 },
  { id: "estado", label: "Estado", minWidth: 100 },
];

export default function AspiranteTareasPage() {
  const [items, setItems] = useState<TareaCrm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    tareaService.getTareas({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  return (
    <DataTable title="Mis tareas" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
      onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
      getId={(r) => r.id_tarea} />
  );
}
