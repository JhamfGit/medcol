/* app/(dashboard)/document-consultation/page.tsx */
"use client";

/* ---------- Tipos ---------- */
interface PacienteDto {
  id_paciente: number;
  msd: string;
  nombre: string;
  no_documento: string;
  id_tipo_documento: number;
  ciudad?: string;
  regimen?: string;
  medico?: string;
  drogueria?: string;
  id_usuario: number;
  fecha_suministro?: string;
}

interface DocumentoDto {
  id_documento: number;
  tipo: string;
  fecha_registro: string;
  es_pendiente: boolean;
  fileUrl: string;
  id_usuario: number;
  paciente: PacienteDto;
}

/* ---------- Fetch helper ---------- */
async function getDocuments(params: { cedula?: string; msd?: string }) {
  console.log("Parámetros enviados a la API:", params);
  const query = new URLSearchParams(params as any).toString();
  const backend = process.env.NEXT_PUBLIC_API_URL;

  if (!backend) throw new Error("NEXT_PUBLIC_API_URL");

  const res = await fetch(`${backend}/documentos?${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al consultar documentos");
  return (await res.json()) as DocumentoDto[];
}

/* ---------- UI imports ---------- */
import { useState } from "react";
import Footer from "@/components/footer";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, FileText, Download, Eye } from "lucide-react";

const downloadFile = async (url: string, fileName: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/* ---------- Componente ---------- */
export default function DocumentConsultationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"cedula" | "msd">("cedula");
  const [docs, setDocs] = useState<DocumentoDto[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<DocumentoDto | null>(null);

  /* ----- búsqueda ----- */
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setDocs([]);
      setHasSearched(false);
      return;
    }

    try {
      const data = await getDocuments(
        searchType === "cedula" ? { cedula: searchTerm } : { msd: searchTerm }
      );
      setDocs(data);
    } catch (err) {
      console.error(err);
      setDocs([]);
    } finally {
      setHasSearched(true);
    }
  };

  const openPreview = (doc: DocumentoDto) => {
    setCurrentDoc(doc);
    setPreviewOpen(true);
  };

  /* ----- render ----- */
  return (
    <div className="space-y-6">
      {/* encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Consultar Documentos
        </h1>
        <p className="text-muted-foreground">
          Busca documentos por cédula o por número MSD.
        </p>
      </div>

      {/* tarjeta búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
          <CardDescription>
            Introduce la cédula o el número MSD del paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              {/* selector radio */}
              <div className="mb-2">
                <span className="text-sm font-medium">Buscar por:</span>
                <div className="flex mt-1 space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchType"
                      className="mr-2"
                      checked={searchType === "cedula"}
                      onChange={() => setSearchType("cedula")}
                    />
                    Cédula
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchType"
                      className="mr-2"
                      checked={searchType === "msd"}
                      onChange={() => setSearchType("msd")}
                    />
                    MSD
                  </label>
                </div>
              </div>

              {/* input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Introduce ${
                    searchType === "cedula" ? "cédula" : "MSD"
                  }`}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleSearch}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* resultados */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              {docs.length > 0
                ? `Se encontraron ${docs.length} documentos`
                : "No se encontraron documentos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {docs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Registro Paciente</TableHead>
                      <TableHead>Fecha de suministro</TableHead>
                      <TableHead>MSD</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((d) => (
                      <TableRow key={d.id_documento}>
                        <TableCell className="font-medium">
                          {d.id_documento}
                        </TableCell>
                        <TableCell>{d.paciente.nombre}</TableCell>
                        <TableCell>{d.paciente.no_documento}</TableCell>
                        <TableCell>{d.tipo}</TableCell>
                        <TableCell>
                          {new Date(d.fecha_registro).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {d.paciente.fecha_suministro
                            ? new Date(
                                d.paciente.fecha_suministro
                              ).toLocaleDateString()
                            : "Sin fecha"}
                        </TableCell>
                        <TableCell>{d.paciente.msd}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(d)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <a
                              href={d.fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No se encontraron documentos
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Intenta con otros criterios de búsqueda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* diálogo preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Documento</DialogTitle>
            <DialogDescription>
              {currentDoc?.tipo} – {currentDoc?.paciente.nombre} –{" "}
              {currentDoc?.paciente.msd}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <img
              src={currentDoc?.fileUrl ?? "/placeholder.svg"}
              alt="Documento"
              className="max-h-[500px] object-contain border rounded-lg"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => window.open(currentDoc?.fileUrl, "_blank")}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
