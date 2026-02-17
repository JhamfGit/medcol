"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Upload, FileText, Save, Clock } from "lucide-react";
import { useAuth } from "../context/auth-context";

const navItems = [
  {
    title: "Inicio",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Capturar Documentos",
    href: "/document-capture",
    icon: Upload,
  },
  {
    title: "Consultar Documentos",
    href: "/document-consultation",
    icon: FileText,
  },
  {
    title: "Documentos Guardados",
    href: "/saved-documents",
    icon: Save,
  },
  {
    title: "Capturar Documentos Pendientes",
    href: "/pending-documents",
    icon: Clock,
  },
];

const adminItems = [
  {
    title: "Gestión de Usuarios",
    href: "/admin/users",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filtrar los elementos de navegación según el rol
  const filteredNavItems = navItems.filter((item) => {
    // Si es usuario externo, solo mostrar Inicio, Consultar Documentos y Documentos Guardados
    if (user?.role === "externo") {
      return [
        "Inicio",
        "Consultar Documentos",
        "Documentos Guardados",
      ].includes(item.title);
    }
    return true;
  });

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">Medcol Docs</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>

        {user?.role === "admin" && (
          <>
            <div className="my-4 px-3">
              <div className="border-t border-gray-200" />
            </div>
            <div className="px-3 text-xs font-semibold uppercase text-gray-500">
              Administración
            </div>
            <nav className="mt-2 space-y-1 px-2">
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
