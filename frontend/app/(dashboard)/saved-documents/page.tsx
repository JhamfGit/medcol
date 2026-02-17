// ✅ Código actualizado del módulo save-document usando lógica de document-consultation

"use client";

import { useState, useRef } from "react";
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
import { Search, Download, Trash, Eye, Upload, Camera } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import Footer from "@/components/footer";

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
}

interface Documento {
  id: number;
  id_documento: number;
  fecha_registro: string;
  documento_tipo: string;
  paciente?: {
    no_documento?: string;
    nombre?: string;
    msd?: string;
    fecha_suministro?: string;
  };
  tipo: string;
  es_pendiente: boolean;
  fileUrl: string;
}

async function getDocuments(params: { cedula?: string; msd?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const backend = process.env.NEXT_PUBLIC_API_URL;

  if (!backend) throw new Error("NEXT_PUBLIC_API_URL");

  const res = await fetch(`${backend}/documentos?${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Error al consultar documentos");
  return (await res.json()) as Documento[];
}

export default function SavedDocumentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"cedula" | "msd">("cedula");
  const [docs, setDocs] = useState<Documento[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Documento | null>(null);
  //const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Documento | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>("");
  const [filteredDocuments, setFilteredDocuments] = useState<Documento[]>([]);

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

  // Funcion para eliminar un documento
  const deleteDocument = () => {
    if (!currentDocument) return;
    setFilteredDocuments((prev) =>
      prev.filter((doc) => doc.id !== currentDocument.id)
    );
    setIsDeleteDialogOpen(false);
  };

  const handleFileUpload = () => {
    setIsUploading(true);

    // Simular una carga de archivo
    setTimeout(() => {
      setIsUploading(false);
      setIsUploadDialogOpen(false);
      // Aquí puedes agregar lógica real de subida si es necesario
    }, 1500);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detener la cámara
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setIsCameraOpen(false);
        setIsUploading(true);

        // Simular una carga de archivo
        setTimeout(() => {
          setIsUploading(false);
          setIsUploadDialogOpen(false);
          // Aquí se actualizaría el documento en una aplicación real
        }, 1500);
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const openPreview = (doc: Documento) => {
    console.log("🖼️ Documento seleccionado:", doc);
    setCurrentDoc(doc);
    setPreviewOpen(true);
  };
  const openDeleteDialog = (document: Documento) => {
    setCurrentDocument(document);
    setIsDeleteDialogOpen(true);
  };
  const openUploadDialog = (document: Documento) => {
    setCurrentDocument(document);
    setIsUploadDialogOpen(true);
  };

  const openCamera = async (documentType: string) => {
    setCurrentDocumentType(documentType);
    setIsCameraOpen(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current
            .play()
            .catch((error) =>
              console.error("No se pudo iniciar el video:", error)
            );
        }
      }, 300);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Documentos Guardados
        </h1>
        <p className="text-muted-foreground">
          Consulta y gestiona los documentos de dispensación de medicamentos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Documentos</CardTitle>
          <CardDescription>
            Busca documentos por cédula del paciente o número MSD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="mb-2">
                <label className="text-sm font-medium">Buscar por:</label>
                <div className="flex mt-1 space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="cedula-search"
                      name="searchType"
                      className="mr-2"
                      checked={searchType === "cedula"}
                      onChange={() => setSearchType("cedula")}
                    />
                    <label htmlFor="cedula-search">Cédula</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="msd-search"
                      name="searchType"
                      className="mr-2"
                      checked={searchType === "msd"}
                      onChange={() => setSearchType("msd")}
                    />
                    <label htmlFor="msd-search">MSD</label>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`Introduce ${searchType === "cedula" ? "cédula" : "MSD"}`}
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
                      <TableHead>Fecha de Suministro</TableHead>
                      <TableHead>MSD</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.length > 0 ? (
                      docs.map((doc) => (
                        <TableRow key={doc.id_documento}>
                          <TableCell className="font-medium">
                            {doc.id_documento || "—"}
                          </TableCell>
                          <TableCell>{doc.paciente?.nombre || "—"}</TableCell>
                          <TableCell>{doc.paciente?.no_documento}</TableCell>
                          <TableCell>{doc.tipo}</TableCell>
                          <TableCell>
                            {doc.fecha_registro
                              ? new Date(
                                  doc.fecha_registro
                                ).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {doc.paciente?.fecha_suministro
                              ? new Date(
                                  doc.paciente.fecha_suministro
                                ).toLocaleDateString()
                              : "Sin fecha"}
                          </TableCell>
                          <TableCell>{doc.paciente?.msd || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPreview(doc)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(doc.fileUrl, "_blank")
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {user?.role === "admin" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog(doc)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                              {doc.es_pendiente && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openUploadDialog(doc)}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron documentos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No se encontraron documentos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de previsualización */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Previsualización de Documento</DialogTitle>
            <DialogDescription>
              {currentDoc?.tipo} {currentDoc?.paciente?.nombre}{" "}
              {currentDoc?.paciente?.msd}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <img
              src={currentDoc?.fileUrl || "/placeholder.svg"}
              alt="Documento"
              className="max-h-[500px] object-contain border rounded-lg"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cerrar
            </Button>
            <Button
              onClick={() => {
                if (!currentDoc?.fileUrl) return;

                const link = document.createElement("a");
                link.href = currentDoc.fileUrl;
                link.setAttribute("download", "");
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Documento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este documento? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-2">
              <strong>Tipo:</strong> {currentDocument?.tipo}
            </p>
            <p className="mb-2">
              <strong>Paciente:</strong>{" "}
              {currentDocument?.paciente?.nombre || "—"}
            </p>
            <p className="mb-2">
              <strong>Cédula:</strong>{" "}
              {currentDocument?.paciente?.no_documento || "—"}
            </p>
            <p>
              <strong>MSD:</strong> {currentDocument?.paciente?.msd || "—"}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={deleteDocument}>
              Eliminar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de subida de documento pendiente */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subir Documento Pendiente</DialogTitle>
            <DialogDescription>
              Sube el documento pendiente para{" "}
              {currentDocument?.paciente?.nombre || "—"} (MSD:{" "}
              {currentDocument?.paciente?.msd || "—"})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById("upload-file")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Archivo
              </Button>
              <input
                id="upload-file"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => openCamera("msd")} // cambio aquí
              >
                <Camera className="mr-2 h-4 w-4" />
                Tomar Foto
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleFileUpload} disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Subir Documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para la cámara */}
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Capturar Documento</DialogTitle>
            <DialogDescription>
              Posiciona el documento frente a la cámara y haz clic en "Capturar"
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full border rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
              />
            </div>

            <div className="flex space-x-4">
              <Button onClick={captureImage}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar
              </Button>
              <Button variant="outline" onClick={closeCamera}>
                Cancelar
              </Button>
            </div>
          </div>

          {/* Canvas oculto para capturar la imagen */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
