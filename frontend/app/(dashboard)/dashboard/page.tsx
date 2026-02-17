"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  Pill,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/auth-context";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<{
    documentosPendientes: number;
    medicamentosPendientes: number;
    documentosHoy: number;
  } | null>(null);

  const [actividad, setActividad] = useState<
    { descripcion: string; fecha: string }[]
  >([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`);
        if (!res.ok) throw new Error("Error al obtener estadísticas");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        setError(true);
        console.error("Error cargando estadísticas:", e);
      }
    };

    const fetchActividad = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/actividad`);
        if (!res.ok) throw new Error("Error al obtener actividad");
        const data = await res.json();
        setActividad(data);
      } catch (e) {
        console.error("Error cargando actividad:", e);
      }
    };

    fetchStats();
    fetchActividad();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido a Medcol Docs, {user?.name}. Aquí tienes una visión general
          de tu sistema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Documentos Pendientes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {error || !stats ? "—" : stats.documentosPendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Medicamentos Pendientes
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {error || !stats ? "—" : stats.medicamentosPendientes}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documentos Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {error || !stats ? "—" : stats.documentosHoy}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas del Sistema
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas comunes que puedes realizar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              asChild
              className="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <Link
                href="/document-capture"
                className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
              >
                <Upload className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Subir Nuevo Documento</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <Link
                href="/document-consultation"
                className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
              >
                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Ver Documentos Recientes</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <Link
                href="/medication-record"
                className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
              >
                <Pill className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  Revisar Registros de Medicamentos
                </span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tus últimas acciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actividad.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay actividad registrada hoy.
                </p>
              ) : (
                actividad.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.fecha).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones del Sistema</CardTitle>
            <CardDescription>Alertas importantes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-red-100 p-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Mantenimiento del Sistema
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mantenimiento programado el sábado a las 02:00
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-yellow-100 p-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Advertencia de Almacenamiento
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Almacenamiento de documentos al 85% de capacidad
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nueva Función Disponible
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Procesamiento por lotes de documentos ahora disponible
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}



