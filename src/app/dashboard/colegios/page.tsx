"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/src/lib/api";

type Colegio = {
  id: number;
  nombre: string;
  direccion?: string | null;
  lat?: number | null;
  lon?: number | null;
  activo: boolean;
  createdAt: string;
};

export default function ColegiosPage() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // crear
  const [newSchool, setNewSchool] = useState<Partial<Colegio>>({
    nombre: "",
    direccion: "",
    lat: undefined,
    lon: undefined,
    activo: true,
  });
  const [creating, setCreating] = useState(false);

  // editar
  const [editing, setEditing] = useState<Colegio | null>(null);
  const [saving, setSaving] = useState(false);

  // eliminar
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchColegios() {
      try {
        const res = await api.get<Colegio[]>("/schools");
        setColegios(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los colegios.");
      } finally {
        setLoading(false);
      }
    }

    fetchColegios();
  }, []);

  // --- crear ---
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const payload = {
        nombre: newSchool.nombre?.trim(),
        direccion: newSchool.direccion?.trim() || null,
        lat:
          newSchool.lat !== undefined && newSchool.lat !== null
            ? Number(newSchool.lat)
            : null,
        lon:
          newSchool.lon !== undefined && newSchool.lon !== null
            ? Number(newSchool.lon)
            : null,
        activo: newSchool.activo ?? true,
      };

      const res = await api.post<Colegio>("/schools", payload);
      setColegios((prev) => [res.data, ...prev]);

      setNewSchool({
        nombre: "",
        direccion: "",
        lat: undefined,
        lon: undefined,
        activo: true,
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el colegio.");
    } finally {
      setCreating(false);
    }
  }

  // --- editar ---
  function handleStartEdit(school: Colegio) {
    setEditing(school);
  }

  function handleCancelEdit() {
    setEditing(null);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;

    setSaving(true);
    setError(null);

    try {
      const payload = {
        nombre: editing.nombre.trim(),
        direccion: editing.direccion?.trim() || null,
        lat:
          editing.lat !== undefined && editing.lat !== null
            ? Number(editing.lat)
            : null,
        lon:
          editing.lon !== undefined && editing.lon !== null
            ? Number(editing.lon)
            : null,
        activo: editing.activo,
      };

      const res = await api.patch<Colegio>(
        `/schools/${editing.id}`,
        payload
      );
      const updated = res.data;

      setColegios((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el colegio.");
    } finally {
      setSaving(false);
    }
  }

  // --- eliminar ---
  async function handleDelete(school: Colegio) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar el colegio "${school.nombre}"?`
    );
    if (!ok) return;

    setDeleteLoadingId(school.id);
    setError(null);

    try {
      await api.delete(`/schools/${school.id}`);
      setColegios((prev) => prev.filter((c) => c.id !== school.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el colegio.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Colegios
          </h2>
          <p className="text-sm text-slate-400">
            Administración de colegios del sistema: nombre, dirección y
            geolocalización.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{colegios.length} colegio(s) registrados</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700/80 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-start gap-2">
          <span className="mt-0.5 text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Crear colegio */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm shadow-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Nuevo colegio
            </h3>
            <p className="text-xs text-slate-400">
              Registra un colegio con su dirección y coordenadas aproximadas.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-2">
            <label className="text-xs text-slate-300">Nombre</label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newSchool.nombre ?? ""}
              onChange={(e) =>
                setNewSchool((prev) => ({ ...prev, nombre: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs text-slate-300">Dirección</label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newSchool.direccion ?? ""}
              onChange={(e) =>
                setNewSchool((prev) => ({
                  ...prev,
                  direccion: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">
              Latitud (opcional)
            </label>
            <input
              type="number"
              step="0.000001"
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newSchool.lat ?? ""}
              onChange={(e) =>
                setNewSchool((prev) => ({
                  ...prev,
                  lat: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">
              Longitud (opcional)
            </label>
            <input
              type="number"
              step="0.000001"
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newSchool.lon ?? ""}
              onChange={(e) =>
                setNewSchool((prev) => ({
                  ...prev,
                  lon: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-6">
            <input
              id="nuevo-activo-colegio"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              checked={newSchool.activo ?? true}
              onChange={(e) =>
                setNewSchool((prev) => ({
                  ...prev,
                  activo: e.target.checked,
                }))
              }
            />
            <label
              htmlFor="nuevo-activo-colegio"
              className="text-xs text-slate-300"
            >
              Colegio activo
            </label>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-500/30 transition-colors"
            >
              {creating ? "Creando..." : "Crear colegio"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de colegios */}
      {loading ? (
        <p className="text-slate-400 text-sm">Cargando colegios...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-sm shadow-sm shadow-black/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr className="text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Dirección</th>
                <th className="px-4 py-3 text-left">Lat</th>
                <th className="px-4 py-3 text-left">Lon</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha alta</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {colegios.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-[13px] text-slate-300 font-mono">
                    #{c.id}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-100">
                    {c.nombre}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {c.direccion || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {c.lat !== null && c.lat !== undefined ? c.lat : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {c.lon !== null && c.lon !== undefined ? c.lon : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {c.activo ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 text-[11px] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/40 px-2 py-0.5 text-[11px] font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="rounded-lg border border-slate-600/80 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700/80 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={deleteLoadingId === c.id}
                        className="rounded-lg border border-red-600/80 px-3 py-1 text-[11px] font-medium text-red-100 hover:bg-red-900/70 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleteLoadingId === c.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {colegios.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-400 text-sm"
                    colSpan={8}
                  >
                    No hay colegios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editar colegio */}
      {editing && (
        <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Editar colegio #{editing.id}
              </h3>
              <p className="text-xs text-slate-400">
                Actualiza el nombre, dirección y coordenadas del colegio.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveEdit}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-2">
              <label className="text-xs text-slate-300">Nombre</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.nombre}
                onChange={(e) =>
                  setEditing({ ...editing, nombre: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
              <label className="text-xs text-slate-300">Dirección</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.direccion ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    direccion: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Latitud</label>
              <input
                type="number"
                step="0.000001"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.lat ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    lat: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Longitud</label>
              <input
                type="number"
                step="0.000001"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.lon ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    lon: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-6">
              <input
                id="edit-colegio-activo"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                checked={editing.activo}
                onChange={(e) =>
                  setEditing({ ...editing, activo: e.target.checked })
                }
              />
              <label
                htmlFor="edit-colegio-activo"
                className="text-xs text-slate-300"
              >
                Colegio activo
              </label>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-500/30 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
