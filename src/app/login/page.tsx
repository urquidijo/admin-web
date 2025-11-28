"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import type { AxiosError } from "axios";

type LoginResponse = {
  access_token: string;
  user: {
    id: number;
    email: string;
    rol: string;
    nombre: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { access_token, user } = res.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", access_token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      router.push("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<any>;
      const backendMsg =
        axiosErr.response?.data?.message || axiosErr.response?.data?.error;

      setErrorMsg(
        backendMsg ||
          "Error al iniciar sesión. Verifica tus credenciales e inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Fondos bonitos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LADO IZQUIERDO: branding */}
            <div className="hidden md:flex flex-col justify-between bg-linear-to-br from-emerald-500/10 via-sky-500/10 to-blue-500/10 p-8 border-r border-slate-800/70">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/40 bg-slate-900/60 px-3 py-1 text-xs text-emerald-200 mb-6">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/50 text-lg">
                    🚌
                  </span>
                  <span>Monitoreo Escolar · Panel Web</span>
                </div>

                <h1 className="text-2xl lg:text-3xl font-semibold leading-tight">
                  Controla tus buses escolares
                  <span className="block text-emerald-300 mt-1">
                    en tiempo real
                  </span>
                </h1>

                <p className="mt-4 text-sm text-slate-200/80 leading-relaxed">
                  Administra colegios, rutas, buses y estudiantes desde un solo
                  lugar. Este panel está conectado con la app móvil para padres
                  y conductores.
                </p>

                <ul className="mt-6 space-y-2 text-sm text-slate-200/90">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Visualiza qué buses están en ruta, en colegio o inactivos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Gestiona los colegios y las cuentas de los padres.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Monitorea el estado general del sistema de transporte.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 text-xs text-slate-400/90">
                <p>Proyecto de Monitoreo de Buses Escolares</p>
                <p className="text-slate-500">
                  Panel de administración · Uso interno
                </p>
              </div>
            </div>

            {/* LADO DERECHO: formulario */}
            <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              <div className="mb-6 md:mb-8 md:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-slate-900/60 px-3 py-1 text-xs text-emerald-200">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/50 text-lg">
                    🚌
                  </span>
                  <span>Monitoreo Escolar · Panel Web</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  Iniciar sesión
                </h2>
                <p className="text-sm text-slate-400">
                  Accede con tu cuenta de administrador para gestionar el
                  sistema de monitoreo escolar.
                </p>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      ✉️
                    </span>
                    <input
                      type="email"
                      className="mt-0 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-9 py-2.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-500/80"
                      placeholder="admin@colegio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-200">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                      🔒
                    </span>
                    <input
                      type="password"
                      className="mt-0 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-9 py-2.5 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40 transition-all placeholder:text-slate-500/80"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-sm text-red-300 bg-red-900/40 border border-red-700/80 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <span className="mt-0.5 text-lg">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-slate-950 font-semibold py-2.5 text-sm transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/20 shadow-emerald-500/20"
                >
                  {loading ? "Ingresando..." : "Ingresar al panel"}
                </button>

                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Acceso solo para personal autorizado del colegio / empresa
                  de transporte.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
