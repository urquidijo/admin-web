"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "../../../lib/api";

type Usuario = {
  id: number;
  rol: "SUPERADMIN" | "ADMIN_COLEGIO" | "CONDUCTOR" | "PADRE";
  email: string;
  nombre: string;
  telefono?: string | null;
  activo: boolean;
  createdAt: string;
};

const ROLES: Usuario["rol"][] = [
  "SUPERADMIN",
  "ADMIN_COLEGIO",
  "CONDUCTOR",
  "PADRE",
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // estado para edición
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const res = await api.get<Usuario[]>("/usuarios");
        setUsuarios(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsuarios();
  }, []);

  // --- acciones CRUD ---

  function handleStartEdit(user: Usuario) {
    setEditing(user);
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
        nombre: editing.nombre,
        email: editing.email,
        telefono: editing.telefono ?? null,
        rol: editing.rol,
        activo: editing.activo,
      };

      const res = await api.patch<Usuario>(`/usuarios/${editing.id}`, payload);
      const updated = res.data;

      setUsuarios((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
      setEditing(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: Usuario) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar al usuario "${user.nombre}" (${user.email})?`
    );
    if (!ok) return;

    setDeleteLoadingId(user.id);
    setError(null);

    try {
      await api.delete(`/usuarios/${user.id}`);
      setUsuarios((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el usuario.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  // --- render ---

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
            Usuarios
          </h2>
          <p className="text-sm text-slate-400">
            Lista y administración básica de usuarios del sistema.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{usuarios.length} usuario(s) registrados</span>
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
        <p className="text-slate-400 text-sm">Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-sm shadow-sm shadow-black/40">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800/80">
              <tr className="text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Fecha alta</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-[13px] text-slate-300 font-mono">
                    #{u.id}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-100">
                    {u.nombre}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    <span className="inline-flex max-w-xs truncate">
                      {u.email}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-200">
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-slate-300">
                    {u.telefono || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {u.activo ? (
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
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStartEdit(u)}
                        className="rounded-lg border border-slate-600/80 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700/80 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deleteLoadingId === u.id}
                        className="rounded-lg border border-red-600/80 px-3 py-1 text-[11px] font-medium text-red-100 hover:bg-red-900/70 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleteLoadingId === u.id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-slate-400 text-sm"
                    colSpan={8}
                  >
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulario de edición */}
      {editing && (
        <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-sm shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Editar usuario #{editing.id}
              </h3>
              <p className="text-xs text-slate-400">
                Actualiza los datos básicos y el rol dentro del sistema.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveEdit}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Nombre</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.nombre}
                onChange={(e) =>
                  setEditing({ ...editing, nombre: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Email</label>
              <input
                type="email"
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.email}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Teléfono</label>
              <input
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.telefono ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    telefono: e.target.value || null,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300">Rol</label>
              <select
                className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                value={editing.rol}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    rol: e.target.value as Usuario["rol"],
                  })
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-6">
              <input
                id="activo"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                checked={editing.activo}
                onChange={(e) =>
                  setEditing({ ...editing, activo: e.target.checked })
                }
              />
              <label htmlFor="activo" className="text-xs text-slate-300">
                Usuario activo
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
