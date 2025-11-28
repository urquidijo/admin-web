"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/lib/api";

type DashboardStats = {
  totalUsuarios: number;
  totalColegios: number;
  totalEstudiantes: number;
  totalBuses: number;
};

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<DashboardStats>("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las estadísticas del sistema.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const usuarios = stats?.totalUsuarios ?? "—";
  const colegios = stats?.totalColegios ?? "—";
  const estudiantes = stats?.totalEstudiantes ?? "—";
  const buses = stats?.totalBuses ?? "—";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Panel de administración
        </h2>
        <p className="text-sm text-slate-400 max-w-xl">
          Administra colegios, usuarios, estudiantes y buses del sistema de
          monitoreo escolar conectado con la app móvil.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-700/70 bg-red-950/40 px-4 py-3 text-sm text-red-100 flex items-start gap-2">
          <span className="mt-0.5 text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Usuarios */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-sm shadow-black/30">
          <div className="absolute right-3 top-3 text-slate-700 text-2xl">
            👤
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Usuarios del sistema
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {loading ? "…" : usuarios}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            SUPERADMIN, ADMIN_COLEGIO, CONDUCTOR y PADRE gestionados desde el
            módulo de usuarios.
          </p>
        </div>

        {/* Estudiantes */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-sm shadow-black/30">
          <div className="absolute right-3 top-3 text-slate-700 text-2xl">
            🎒
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Estudiantes
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {loading ? "…" : estudiantes}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Estudiantes vinculados a un colegio, con domicilio geolocalizado y
            asignación a buses.
          </p>
        </div>

        {/* Colegios */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-sm shadow-black/30">
          <div className="absolute right-3 top-3 text-slate-700 text-2xl">
            🏫
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Colegios
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {loading ? "…" : colegios}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Colegios con ubicación (lat/lon), administradores y flota de buses
            asociados.
          </p>
        </div>

        {/* Buses */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-sm shadow-black/30">
          <div className="absolute right-3 top-3 text-slate-700 text-2xl">
            🚌
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Buses y rutas
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {loading ? "…" : buses}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Buses por colegio, conductor asignado, paradas ordenadas y
            telemetría en tiempo real.
          </p>
        </div>
      </section>
    </div>
  );
}
