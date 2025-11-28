"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "../../../lib/api";

type Estudiante = {
  id: number;
  colegioId: number;
  codigo: string;
  ci?: string | null;
  nombre: string;
  curso?: string | null;
  homeLat?: number | null;
  homeLon?: number | null;
  activo: boolean;
  createdAt: string;
};

export default function EstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // crear
  const [newStudent, setNewStudent] = useState<Partial<Estudiante>>({
    colegioId: undefined,
    codigo: "",
    ci: "",
    nombre: "",
    curso: "",
    homeLat: undefined,
    homeLon: undefined,
    activo: true,
  });
  const [creating, setCreating] = useState(false);

  // editar
  const [editing, setEditing] = useState<Estudiante | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEstudiantes() {
      try {
        const res = await api.get<Estudiante[]>("/estudiantes");
        setEstudiantes(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los estudiantes.");
      } finally {
        setLoading(false);
      }
    }

    fetchEstudiantes();
  }, []);

  // --- crear ---
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    try {
      const payload = {
        colegioId: Number(newStudent.colegioId),
        codigo: newStudent.codigo?.trim(),
        ci: newStudent.ci?.trim() || null,
        nombre: newStudent.nombre?.trim(),
        curso: newStudent.curso?.trim() || null,
        homeLat:
          newStudent.homeLat !== undefined && newStudent.homeLat !== null
            ? Number(newStudent.homeLat)
            : null,
        homeLon:
          newStudent.homeLon !== undefined && newStudent.homeLon !== null
            ? Number(newStudent.homeLon)
            : null,
        activo: newStudent.activo ?? true,
      };

      const res = await api.post<Estudiante>("/estudiantes", payload);
      setEstudiantes((prev) => [res.data, ...prev]);

      setNewStudent({
        colegioId: newStudent.colegioId,
        codigo: "",
        ci: "",
        nombre: "",
        curso: "",
        homeLat: undefined,
        homeLon: undefined,
        activo: true,
      });
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el estudiante.");
    } finally {
      setCreating(false);
    }
  }

  // --- editar ---
  function handleStartEdit(est: Estudiante) {
    setEditing(est);
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
        colegioId: editing.colegioId,
        codigo: editing.codigo.trim(),
        ci: editing.ci?.trim() || null,
        nombre: editing.nombre.trim(),
        curso: editing.curso?.trim() || null,
        homeLat:
          editing.homeLat !== undefined && editing.homeLat !== null
            ? Number(editing.homeLat)
            : null,
        homeLon:
          editing.homeLon !== undefined && editing.homeLon !== null
            ? Number(editing.homeLon)
            : null,
        activo: editing.activo,
      };

      const res = await api.patch<Estudiante>(
        `/estudiantes/${editing.id}`,
        payload
      );
      const updated = res.data;

      setEstudiantes((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estudiante.");
    } finally {
      setSaving(false);
    }
  }

  // --- eliminar ---
  async function handleDelete(est: Estudiante) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar al estudiante "${est.nombre}" (código: ${est.codigo})?`
    );
    if (!ok) return;

    setDeleteLoadingId(est.id);
    setError(null);

    try {
      await api.delete(`/estudiantes/${est.id}`);
      setEstudiantes((prev) => prev.filter((e) => e.id !== est.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el estudiante.");
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
            Estudiantes
          </h2>
          <p className="text-sm text-slate-400">
            Administración de estudiantes, su colegio y domicilio geolocalizado.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>{estudiantes.length} estudiante(s) registrados</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-700/80 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-start gap-2">
          <span className="mt-0.5 text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Crear estudiante */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm shadow-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Nuevo estudiante
            </h3>
            <p className="text-xs text-slate-400">
              Registra un estudiante con su colegio y ubicación de domicilio.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">Colegio ID</label>
            <input
              type="number"
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.colegioId ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({
                  ...prev,
                  colegioId: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">Código</label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.codigo ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, codigo: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">CI (opcional)</label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.ci ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, ci: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">Nombre</label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.nombre ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, nombre: e.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">
              Curso (opcional)
            </label>
            <input
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.curso ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, curso: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">
              Home Lat (opcional)
            </label>
            <input
              type="number"
              step="0.000001"
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.homeLat ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({
                  ...prev,
                  homeLat: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-300">
              Home Lon (opcional)
            </label>
            <input
              type="number"
              step="0.000001"
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
              value={newStudent.homeLon ?? ""}
              onChange={(e) =>
                setNewStudent((prev) => ({
                  ...prev,
                  homeLon: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-2 md:mt-6">
            <input
              id="nuevo-activo"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              checked={newStudent.activo ?? true}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, activo: e.target.checked }))
              }
            />
            <label htmlFor="nuevo-activo" className="text-xs text-slate-300">
              Estudiante activo
            </label>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-500/30 transition-colors"
            >
              {creating ? "Creando..." : "Crear estudiante"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-slate-400 text-sm">Cargando estudiantes...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-sm shadow-sm shadow-black/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr className="text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Colegio</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Curso</th>
                <th className="px-4 py-3 text-left">CI</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {estudiantes.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-[13px] text-slate-300 font-mono">
                    #{e.id}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-200">
                    {e.colegioId}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-100">
                    {e.codigo}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-100">
                    {e.nombre}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {e.curso || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {e.ci || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {e.activo ? (
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
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStartEdit(e)}
                        className="rounded-lg border border-slate-600/80 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700/80 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(e)}
                        disabled={deleteLoadingId === e.id}
                        className="rounded-lg border border-red-600/80 px-3 py-1 text-[11px] font-medium text-red-100 hover:bg-red-900/70 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleteLoadingId === e.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {estudiantes.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-400 text-sm"
                    colSpan={8}
                  >
                    No hay estudiantes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editar estudiante */}
      {editing && (
        <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Editar estudiante #{editing.id}
              </h3>
              <p className="text-xs text-slate-400">
                Modifica los datos del estudiante y su ubicación.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveEdit}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Colegio ID</label>
              <input
                type="number"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.colegioId}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    colegioId: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Código</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.codigo}
                onChange={(e) =>
                  setEditing({ ...editing, codigo: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">CI</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.ci ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, ci: e.target.value || null })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Nombre</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.nombre}
                onChange={(e) =>
                  setEditing({ ...editing, nombre: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Curso</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.curso ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, curso: e.target.value || null })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">
                Home Lat (opcional)
              </label>
              <input
                type="number"
                step="0.000001"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.homeLat ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    homeLat: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">
                Home Lon (opcional)
              </label>
              <input
                type="number"
                step="0.000001"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.homeLon ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    homeLon: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-6">
              <input
                id="edit-activo"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                checked={editing.activo}
                onChange={(e) =>
                  setEditing({ ...editing, activo: e.target.checked })
                }
              />
              <label htmlFor="edit-activo" className="text-xs text-slate-300">
                Estudiante activo
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
