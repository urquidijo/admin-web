"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

const menuItems = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/usuarios", label: "Usuarios" },
  { href: "/dashboard/estudiantes", label: "Estudiantes" },
  { href: "/dashboard/colegios", label: "Colegios" },
  { href: "/dashboard/padreHijo", label: "Padre" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) return;

    try {
      const user = JSON.parse(raw);
      setUserName(user.nombre || user.email || "Usuario");
    } catch {
      setUserName("Usuario");
    }
  }, []);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  }

  // 🔹 Helper para saber si un item está activo
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      // Resumen solo en la raíz exacta
      return pathname === "/dashboard";
    }
    // El resto sí puede usar prefijo
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 px-4 py-6 flex flex-col backdrop-blur-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xl">
              🚌
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                Monitoreo Escolar
              </h1>
              <p className="text-[11px] text-slate-400">
                Panel de administración
              </p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white")
                  }
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs">
            <p className="text-slate-400 mb-1">Sesión iniciada como</p>
            <p className="text-sm font-semibold truncate mb-3">
              {userName || "Usuario"}
            </p>
            <button
              onClick={handleLogout}
              className="w-full text-xs rounded-lg border border-slate-700/80 px-3 py-2 hover:bg-slate-800/80 transition-colors"
            >
              Cerrar sesión
            </button>
            <p className="mt-3 text-[10px] text-slate-500 leading-snug">
              Uso interno del sistema de transporte escolar. Asegura la
              confidencialidad de los datos de estudiantes y padres.
            </p>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-md p-5 sm:p-6 lg:p-8 min-h-[calc(100vh-2rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
