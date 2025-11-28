"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";

type PadreHijoRelation = {
  padreId: number;
  padreNombre: string;
  padreEmail: string;
  padreRol: string;
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  colegioId: number | null;
  colegioNombre: string | null;
  vinculacionDesde: string;
};

export default function PadreHijoPage() {
  const [rows, setRows] = useState<PadreHijoRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlinkLoadingKey, setUnlinkLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelations() {
      try {
        const res = await api.get<PadreHijoRelation[]>(
          "/admin/parent-children"
        );
        setRows(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las relaciones padre–hijo.");
      } finally {
        setLoading(false);
      }
    }

    fetchRelations();
  }, []);

  async function handleUnlink(rel: PadreHijoRelation) {
    const label = `${rel.padreNombre} ↔ ${rel.estudianteNombre}`;
    const ok = window.confirm(
      `¿Seguro que deseas desvincular al padre "${rel.padreNombre}" del estudiante "${rel.estudianteNombre}"?`
    );
    if (!ok) return;

    const key = `${rel.padreId}-${rel.estudianteId}`;
    setUnlinkLoadingKey(key);
    setError(null);

    try {
      await api.delete(
        `/admin/parent-children/${rel.padreId}/${rel.estudianteId}`
      );
      setRows((prev) =>
        prev.filter(
          (r) =>
            !(
              r.padreId === rel.padreId &&
              r.estudianteId === rel.estudianteId
            )
        )
      );
    } catch (err) {
      console.error(err);
      setError(`No se pudo desvincular la relación ${label}.`);
    } finally {
      setUnlinkLoadingKey(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Relaciones padre–hijo
          </h2>
          <p className="text-sm text-slate-400">
            Visualiza qué padres están vinculados a qué estudiantes y permite
            desvincular la relación desde aquí.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>{rows.length} relación(es) registradas</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700/80 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-start gap-2">
          <span className="mt-0.5 text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">Cargando relaciones...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-sm shadow-sm shadow-black/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr className="text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Padre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estudiante</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Colegio</th>
                <th className="px-4 py-3 text-left">Vinculado desde</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const key = `${r.padreId}-${r.estudianteId}`;
                return (
                  <tr
                    key={key}
                    className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-[13px] text-slate-100">
                      {r.padreNombre}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-300">
                      <span className="inline-flex max-w-xs truncate">
                        {r.padreEmail}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                        {r.padreRol}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-100">
                      {r.estudianteNombre}
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-slate-200">
                      {r.estudianteCodigo}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.colegioNombre ? (
                        <span className="inline-flex items-center rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                          {r.colegioNombre}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-slate-400">
                      {new Date(r.vinculacionDesde).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleUnlink(r)}
                        disabled={unlinkLoadingKey === key}
                        className="rounded-lg border border-red-600/80 px-3 py-1 text-[11px] font-medium text-red-100 hover:bg-red-900/70 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {unlinkLoadingKey === key
                          ? "Desvinculando..."
                          : "Desvincular"}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-400 text-sm"
                    colSpan={8}
                  >
                    No hay relaciones padre–hijo registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
