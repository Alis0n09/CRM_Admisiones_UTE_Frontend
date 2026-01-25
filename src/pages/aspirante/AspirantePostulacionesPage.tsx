import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as postulacionService from "../../services/postulacion.service";
import type { Postulacion } from "../../services/postulacion.service";
const cols: Column<Postulacion>[] = [
  { id: "carrera", label: "Carrera", minWidth: 200, format: (_, r) => r.carrera?.nombre_carrera ?? "-" },
  { id: "periodo_academico", label: "Período", minWidth: 100 },
  { id: "fecha_postulacion", label: "Fecha", minWidth: 100 },
  { id: "estado_postulacion", label: "Estado", minWidth: 110 },
];
export default function AspirantePostulacionesPage() {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const load = useCallback(() => {
    postulacionService.getPostulaciones({ page, limit }).then((r: any) => {
      const list = r?.items ?? (Array.isArray(r) ? r : []);
      setItems(list);
      setTotal(r?.meta?.totalItems ?? list.length);
    }).catch(() => setItems([]));
  }, [page, limit]);
  useEffect(() => load(), [load]);
  return (
    <DataTable title="Mis postulaciones" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
      onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
      getId={(r) => r.id_postulacion} />
  );
}
