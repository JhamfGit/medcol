"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MoreVertical,
  Download,
  Printer,
  Eye,
  Pill,
  CheckCircle,
} from "lucide-react";

import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";

interface Entrega {
  id_entrega: number;
  paciente: { no_documento: string };
  nombre_generico: string;
  concentracion: string | null;
  fecha_suministro: string; // ISO
  estado: string; // 'P' o 'D' u 'DISPENSADO','PENDIENTE'
  numero_unidades?: number; // si lo guardaste
  cantidad_ordenada?: number; // si lo guardaste
}

export default function MedicationRecordPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [delivered, setDelivered] = useState<Entrega[]>([]);
  const [pending, setPending] = useState<Entrega[]>([]);
  const [delSearch, setDelSearch] = useState("");
  const [penSearch, setPenSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) Seguridad
  useEffect(() => {
    if (user?.role === "externo") router.push("/dashboard");
  }, [user, router]);
  if (user?.role === "externo")
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            No tienes permiso para acceder a esta página.
          </p>
        </div>
      </div>
    );

  // 2) Al montar, cargar datos
  useEffect(() => {
    const fetchEntregas = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("medcol-user-token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/entregas`, // sin ?estado
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Error cargando medicamentos");
        const data: Entrega[] = await res.json();
        setDelivered(
          data.filter((e) => e.estado === "D" || e.estado === "DISPENSADO")
        );
        setPending(
          data.filter((e) => e.estado === "P" || e.estado === "PENDIENTE")
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntregas();
  }, []);

  // 3) Funciones de búsqueda
  const filteredDelivered = delivered.filter(
    (m) =>
      m.nombre_generico.toLowerCase().includes(delSearch.toLowerCase()) ||
      String(m.paciente.no_documento)
        .toLowerCase()
        .includes(delSearch.toLowerCase())
  );
  const filteredPending = pending.filter(
    (m) =>
      m.nombre_generico.toLowerCase().includes(penSearch.toLowerCase()) ||
      String(m.paciente.no_documento)
        .toLowerCase()
        .includes(penSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Registro de Medicamentos
        </h1>
        <p className="text-muted-foreground">
          Ver y gestionar entregas de medicamentos
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="delivered" className="space-y-6">
        <TabsList>
          <TabsTrigger value="delivered">Entregados</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
        </TabsList>

        {/* Entregados */}
        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos Entregados</CardTitle>
              <CardDescription>
                Ver todos los medicamentos que han sido entregados a los
                pacientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Buscador + Imprimir */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar medicamentos..."
                    className="pl-8"
                    value={delSearch}
                    onChange={(e) => setDelSearch(e.target.value)}
                  />
                </div>
                <Button disabled={loading}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Informe
                </Button>
              </div>
              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Entrega</TableHead>
                      <TableHead>ID Paciente</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Dosis</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Fecha de Entrega</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDelivered.map((med) => (
                      <TableRow key={med.id_entrega}>
                        <TableCell className="font-medium">
                          {med.id_entrega}
                        </TableCell>
                        <TableCell>{med.paciente.no_documento}</TableCell>
                        <TableCell>{med.nombre_generico}</TableCell>
                        <TableCell>{med.concentracion}</TableCell>
                        <TableCell>{med.cantidad_ordenada ?? "-"}</TableCell>
                        <TableCell>
                          {new Date(med.fecha_suministro).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">{med.estado}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* … acciones … */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Descargar Registro
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir Registro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDelivered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {loading
                            ? "Cargando…"
                            : "No se encontraron medicamentos."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pendientes */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Medicamentos Pendientes</CardTitle>
              <CardDescription>
                Ver todos los medicamentos que están pendientes de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Buscador + Botón */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar medicamentos..."
                    className="pl-8"
                    value={penSearch}
                    onChange={(e) => setPenSearch(e.target.value)}
                  />
                </div>
                <Button disabled={loading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar como Entregado
                </Button>
              </div>
              {/* Tabla */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Entrega</TableHead>
                      <TableHead>ID Paciente</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Dosis</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Fecha de Solicitud</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.map((med) => (
                      <TableRow key={med.id_entrega}>
                        <TableCell className="font-medium">
                          {med.id_entrega}
                        </TableCell>
                        <TableCell>{med.paciente.no_documento}</TableCell>
                        <TableCell>{med.nombre_generico}</TableCell>
                        <TableCell>{med.concentracion}</TableCell>
                        <TableCell>{med.numero_unidades ?? "-"}</TableCell>
                        <TableCell>
                          {new Date(med.fecha_suministro).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            {med.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* … acciones … */}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPending.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {loading
                            ? "Cargando…"
                            : "No se encontraron medicamentos pendientes."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
