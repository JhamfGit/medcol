"use client";

import type React from "react";
import { Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Upload,
  Camera,
  FileText,
  Download,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogFooter } from "@/components/ui/dialog";
import Footer from "@/components/footer"

// Datos simulados de pacientes (en una aplicación real, esto vendría de una API)
const patientData = [
  {
    cedula: "1098765432",
    nombre: "Maria Alejandra Rodriguez Gomez",
    direccion: "Calle 123 #45-67, Bogotá, Colombia",
    eps: "Sanitas EPS",
    msd: "MSD-001",
  },
  {
    cedula: "0987654321",
    nombre: "Carlos Andrés Martínez López",
    direccion: "Carrera 45 #12-34, Medellín, Colombia",
    eps: "Nueva EPS",
    msd: "MSD-002",
  },
];

const formSchema = z.object({
  searchType: z.enum(["msd", "cedula"]),
  searchTerm: z.string().min(1, "Por favor, introduce un término de búsqueda"),
});

export default function PendingDocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [patientFound, setPatientFound] = useState<
    (typeof patientData)[0] | null
  >(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>("");
  const [capturedImages, setCapturedImages] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [documentos, setDocumentos] = useState([]);

  type Documento = {
    id: number;
    type: string;
    fileUrl: string;
    date: string;
  };

  const [currentPreviewDocument, setCurrentPreviewDocument] =
    useState<Documento | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cedulaFront, setCedulaFront] = useState<string | null>(null);
  const [showBackAlert, setShowBackAlert] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchType: "msd",
      searchTerm: "",
    },
  });

  const fetchDocumentos = async (searchType: string, searchTerm: string) => {
    try {
      const params = new URLSearchParams();

      if (searchType === "msd") {
        params.append("msd", searchTerm);
      } else {
        params.append("no_documento", searchTerm);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${baseUrl}/pendientes/buscar?${params.toString()}`,
      );

      if (!response.ok) throw new Error("Error al consultar documentos");

      const data = await response.json();
      setDocumentos(data);
    } catch (error) {
      console.error("Error al buscar documentos:", error);
      alert("No se pudieron cargar los documentos.");
    }
  };

  // Redirigir si el usuario es externo
  useEffect(() => {
    if (user?.role === "externo") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Limpiar el stream de la cámara cuando se cierra
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Si el usuario es externo, mostrar mensaje de acceso denegado
  if (user?.role === "externo") {
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
  }

  // Función para buscar paciente
  const searchPatient = async (data: z.infer<typeof formSchema>) => {
    try {
      const params = new URLSearchParams();

      if (data.searchType === "msd") {
        params.append("msd", data.searchTerm);
      } else {
        params.append("no_documento", data.searchTerm);
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${baseUrl}/pendientes/buscar?${params.toString()}`,
      );

      if (!response.ok) throw new Error("No se encontró información");

      const result = await response.json();

      if (!result.paciente) {
        setPatientFound(null);
        setDocumentos([]);
        alert("No se encontró ningún paciente con los datos proporcionados.");
        return;
      }

      // ✅ Actualiza estado con los datos reales
      setPatientFound({
        cedula: result.paciente.no_documento,
        nombre: result.paciente.nombre,
        direccion: result.paciente.direccion ?? "Dirección no disponible",
        eps: result.paciente.eps ?? "EPS no disponible",
        msd: result.paciente.msd,
      });

      setDocumentos(result.documentos);
    } catch (error) {
      console.error("❌ Error al buscar:", error);
      alert("No se pudieron obtener los datos del paciente.");
    }
  };

  // Función para abrir la cámara
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
              console.error("No se pudo iniciar el video:", error),
            );
        }
      }, 300); // esperar a que el modal renderice el <video>
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
      );
    }
  };

  // Función para capturar imagen
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && currentDocumentType) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");

      // Si estamos capturando cédula
      if (currentDocumentType === "cedula") {
        if (!cedulaFront) {
          // Primera foto (frontal)
          setCedulaFront(imageDataUrl);
          setShowBackAlert(true);
          return;
        } else {
          // Segunda foto (trasera) → combinar
          combineCedulaImages(cedulaFront, imageDataUrl);
          setCedulaFront(null);
          if (stream) stream.getTracks().forEach((track) => track.stop());
          setIsCameraOpen(false);
          return;
        }
      }

      // Otros documentos: guardar directamente
      setCapturedImages((prev) => {
        if (currentDocumentType === "msd") {
          return {
            ...prev,
            [currentDocumentType]: [
              ...(prev[currentDocumentType] || []),
              imageDataUrl,
            ],
          };
        }
        return { ...prev, [currentDocumentType]: imageDataUrl };
      });

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraOpen(false);
    }
  };

  //Función para unir las dos fotos de la cédula
  const combineCedulaImages = (front: string, back: string) => {
    const imgFront = new Image();
    const imgBack = new Image();

    imgFront.onload = () => {
      imgBack.onload = () => {
        const canvas = document.createElement("canvas");
        const width = Math.max(imgFront.width, imgBack.width);
        const height = imgFront.height + imgBack.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgFront, 0, 0);
          ctx.drawImage(imgBack, 0, imgFront.height);

          const combinedImage = canvas.toDataURL("image/png");
          setCapturedImages((prev) => ({
            ...prev,
            cedula: combinedImage,
          }));
        }
      };
      imgBack.src = back;
    };
    imgFront.src = front;
  };

  // Función para cerrar la cámara
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  // Función para manejar la subida de archivos
  const handleFileUpload = (
    documentType: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => ({
        ...prev,
        [documentType]: file,
      }));

      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setCapturedImages((prev) => ({
            ...prev,
            [documentType]: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para previsualizar un documento almacenado
  const previewStoredDocument = (document: Documento) => {
    setCurrentPreviewDocument(document);
    setIsDocumentPreviewOpen(true);
  };

  // Función para previsualizar un documento capturado
  const previewCapturedDocument = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsPreviewOpen(true);
  };

  // Función para guardar todos los documentos
  const saveAllDocuments = () => {
    setIsSubmitting(true);

    // Simular envío a API
    setTimeout(() => {
      setIsSuccess(true);
      setIsSubmitting(false);

      // Resetear después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
        setPatientFound(null);
        setCapturedImages({});
        setUploadedFiles({});
        form.reset();
      }, 3000);
    }, 1500);
  };

  // Verificar si hay documentos para guardar
  const hasDocumentsToSave =
    Object.keys(capturedImages).length > 0 ||
    Object.keys(uploadedFiles).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Capturar Documentos Pendientes
        </h1>
        <p className="text-muted-foreground">
          Almacena documentos adicionales para entregas de medicamentos
          pendientes
        </p>
      </div>
      {isSuccess && (
        <Alert className="bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>
            Los documentos han sido guardados correctamente.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Paciente</CardTitle>
          <CardDescription>
            Introduce el número MSD o cédula para buscar la información del
            paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(searchPatient)}
              className="space-y-4"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="searchType"
                    render={({ field }) => (
                      <FormItem className="space-y-0 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="msd"
                            value="msd"
                            checked={field.value === "msd"}
                            onChange={() => field.onChange("msd")}
                            className="mr-1"
                          />
                          <label htmlFor="msd">MSD Number</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="cedula"
                            value="cedula"
                            checked={field.value === "cedula"}
                            onChange={() => field.onChange("cedula")}
                            className="mr-1"
                          />
                          <label htmlFor="cedula">ID Card (Cédula)</label>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-4">
                  <FormField
                    control={form.control}
                    name="searchTerm"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder={`Introduce ${form.getValues().searchType === "msd"
                                ? "MSD"
                                : "cédula"
                                }`}
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Paciente
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      {patientFound && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Información del Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Nombre Completo
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.nombre}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Número de Cédula
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.cedula}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Previamente Almacenados</CardTitle>
              <CardDescription>
                Estos documentos ya han sido almacenados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Documento</TableHead>
                    <TableHead>Fecha de Carga</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((doc: Documento) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.type}</TableCell>
                      <TableCell>
                        {new Date(doc.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            previewStoredDocument({
                              id: doc.id,
                              type: doc.type,
                              date: doc.date,
                              fileUrl: doc.fileUrl,
                            })
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentación de Entrega de Medicamentos</CardTitle>
              <CardDescription>
                Sube documentos adicionales requeridos para la entrega de
                medicamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulario de Confirmación de Entrega */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">
                      Formulario de Confirmación de Entrega
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara del formulario de
                      confirmación de entrega
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("confirmacion-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="confirmacion-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("confirmacion", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera("confirmacion")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>
                {capturedImages["confirmacion"] && (
                  <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">
                            Formulario de Confirmación
                          </p>
                          <p className="text-sm text-gray-500">
                            Documento capturado
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            previewCapturedDocument(
                              capturedImages["confirmacion"],
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setCapturedImages((prev) => {
                              const newImages = { ...prev };
                              delete newImages["confirmacion"];
                              return newImages;
                            });
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1 text-red-500" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Firma de Recibo de Medicamento */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">
                      Firma de Recibo de Medicamento
                    </h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara de la firma de recibo de
                      medicamento
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("firma-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="firma-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("firma", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera("firma")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>
                {capturedImages["firma"] && (
                  <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Firma de Recibo</p>
                          <p className="text-sm text-gray-500">
                            Documento capturado
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            previewCapturedDocument(capturedImages["firma"])
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setCapturedImages((prev) => {
                              const newImages = { ...prev };
                              delete newImages["firma"];
                              return newImages;
                            });
                          }}
                        >
                          <Trash className="h-4 w-4 mr-1 text-red-500" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end">
                <Button
                  onClick={saveAllDocuments}
                  disabled={!hasDocumentsToSave || isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Documentos"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      {/* Diálogo para previsualización de documentos almacenados */}
      <Dialog
        open={isDocumentPreviewOpen}
        onOpenChange={setIsDocumentPreviewOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentPreviewDocument?.type}</DialogTitle>
            <DialogDescription>
              Subido el{" "}
              {currentPreviewDocument?.date &&
                new Date(currentPreviewDocument.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center">
            <img
              src={currentPreviewDocument?.fileUrl || "/placeholder.svg"}
              alt="Documento"
              className="max-h-[500px] object-contain border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDocumentPreviewOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() =>
                window.open(currentPreviewDocument?.fileUrl, "_blank")
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Diálogo para capturar ambas caras del documento de identidad */}
      <Dialog open={showBackAlert} onOpenChange={setShowBackAlert}>
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <DialogTitle>Voltea el Documento de identidad</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Por favor, voltea el documento para capturar la parte trasera.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowBackAlert(false)}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
