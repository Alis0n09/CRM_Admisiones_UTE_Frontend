import { useCallback, useEffect, useState } from "react";
import DataTable, { type Column } from "../../components/DataTable";
import * as s from "../../services/carrera.service";
import type { Carrera } from "../../services/carrera.service";

const cols: Column<Carrera>[] = [
  { id: "nombre_carrera", label: "Carrera", minWidth: 200 },
  { id: "facultad", label: "Facultad", minWidth: 120 },
  { id: "duracion_semestres", label: "Semestres", minWidth: 90 },
  { id: "nivel_grado", label: "Nivel", minWidth: 90 },
  { id: "cupos_disponibles", label: "Cupos", minWidth: 70 },
];

export default function AspiranteCarrerasPage() {
  const [items, setItems] = useState<Carrera[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const load = useCallback(() => {
    s.getCarreras({ page, limit }).then((r: any) => {
      setItems(r?.items ?? []);
      setTotal(r?.meta?.totalItems ?? 0);
    }).catch(() => setItems([]));
  }, [page, limit]);

  useEffect(() => load(), [load]);

  return (
    <DataTable title="Carreras" columns={cols} rows={items} total={total} page={page} rowsPerPage={limit}
      onPageChange={setPage} onRowsPerPageChange={(l) => { setLimit(l); setPage(1); }}
      getId={(r) => r.id_carrera} />
  );
}
