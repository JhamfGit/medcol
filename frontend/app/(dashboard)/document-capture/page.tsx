"use client";

import type React from "react";

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
import { Trash } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import Footer from "@/components/footer";
import Cookies from "js-cookie";

//import { useRouter } from "next/router";

const formSchema = z.object({
  searchType: z.enum(["factura", "idusuario"]),
  searchTerm: z.string().min(1, "Por favor, introduce un término de búsqueda"),
});

type Patient = {
  idusuario: string;
  paciente: string;
  ciudad: string;
  drogueria: string;
  factura: string;
  tipodocument: string;
  regimen: string;
  medico: string;
  estado: string;
  // fecha_suministro?: string | null;
};

export default function DocumentCapturePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState<string>("");
  const [capturedImages, setCapturedImages] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any>>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cedulaFront, setCedulaFront] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientFound, setPatientFound] = useState<Patient | null>(null);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(false);
  const [errorPatients, setErrorPatients] = useState<string | null>(null);
  const [showBackAlert, setShowBackAlert] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState<
    { id_tipo_documento: number; descripcion: string }[]
  >([]);
  const [entregaPendiente, setEntregaPendiente] = useState(false);
  const [mostrarOtrosDocumentos, setMostrarOtrosDocumentos] = useState(false);
  const [tipoDocumentoOtro, setTipoDocumentoOtro] = useState("tutela");
  //const [hasDocumentsToSave, setHasDocumentsToSave] = useState(false);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);

  // Función para mapear nombre a id_tipo_documento
  function obtenerIdTipoDocumento(nombre: string): number | null {
    if (!Array.isArray(tiposDocumento)) {
      console.error("❌ tiposDocumento no es un array:", tiposDocumento);
      return null;
    }

    const normalizeString = (str: string) =>
      str ? str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

    console.log("🔍 Intentando mapear tipo de documento:", nombre);

    // Mapeo de abreviaturas comunes
    const mapping: Record<string, string> = {
      "cc": "cedula de ciudadania",
      "ti": "tarjeta de identidad",
      "ce": "cedula de extranjeria",
      "pa": "pasaporte",
      "rc": "registro civil",
      "ms": "menor sin identificacion",
      "as": "adulto sin identificacion",
    };

    const normalizedInput = normalizeString(nombre);
    const mappedSearch = mapping[normalizedInput] || normalizedInput;

    const tipo = tiposDocumento.find((t) => {
      const desc = normalizeString(t.descripcion);
      return desc === normalizedInput || desc === mappedSearch;
    });

    if (!tipo) {
      console.warn(`⚠️ No se encontró coincidencia para: "${nombre}" (normalizado: "${normalizedInput}", mapeado a: "${mappedSearch}")`);
      console.log("📋 Opciones disponibles (normalizadas):", tiposDocumento.map(t => normalizeString(t.descripcion)));
    } else {
      console.log("✅ Coincidencia encontrada:", tipo);
    }

    return tipo ? tipo.id_tipo_documento : null;
  }

  // Función base64 a Blob
  function base64ToBlob(base64: string, contentType = "image/png"): Blob {
    const byteString = atob(base64.split(",")[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([intArray], { type: contentType });
  }

  // Función para guardar paciente y documentos
  const savePacienteYDocumentos = async () => {
    if (!patientFound) {
      alert("Busca primero un paciente antes de guardar.");
      return;
    }

    setIsSubmitting(true);
    setDocumentError("");

    try {
      const idTipoDoc = obtenerIdTipoDocumento(patientFound.tipodocument);
      if (!idTipoDoc) {
        setDocumentError("Tipo de documento inválido para el paciente.");
        setIsSubmitting(false);
        return;
      }

      // 1. Guardar paciente
      const pacientePayload = {
        msd: patientFound.factura,
        nombre: patientFound.paciente,
        no_documento: patientFound.idusuario,
        id_tipo_documento: idTipoDoc,
        ciudad: patientFound.ciudad,
        regimen: patientFound.regimen,
        medico: patientFound.medico,
        drogueria: patientFound.drogueria,
        //fecha_suministro: patientFound.fecha_suministro || null,
        id_usuario: Number(user?.id || 0),
        medicamentos: medicamentos,
      };
      console.log("Payload que se envía:", pacientePayload);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const pacienteRes = await fetch(
        `${baseUrl}/pacientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pacientePayload),
        }
      );

      if (!pacienteRes.ok) {
        const errorText = await pacienteRes.text();
        throw new Error("Error guardando paciente: " + errorText);
      }

      const pacienteData = await pacienteRes.json();

      // 2. Guardar documentos
      const formData = new FormData();
      formData.append("id_paciente", pacienteData.id_paciente.toString());
      formData.append("es_pendiente", entregaPendiente.toString());

      Object.entries(capturedImages).forEach(([tipo, data]) => {
        // prefijo si es parte de "otros"
        const otrosTipos = ["tutela", "forean", "exoneracion", "portabilidad"];
        const prefijo = otrosTipos.includes(tipo) ? `otros_${tipo}` : tipo;

        if (Array.isArray(data)) {
          data.forEach((base64, index) => {
            if (typeof base64 === "string" && base64.includes(",")) {
              const blob = base64ToBlob(base64, "image/png");
              formData.append(
                "documentos",
                blob,
                `${prefijo}_${index + 1}.png`
              );
            }
          });
        } else if (typeof data === "string" && data.includes(",")) {
          const blob = base64ToBlob(data, "image/png");
          formData.append("documentos", blob, `${prefijo}.png`);
        }
      });

      // 3. Guardar medicamentos vía tu proxy de Next.js
      const entregaRes = await fetch("/api/entregas/guardar-medicamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("medcol-user-token")}`,
        },
        body: JSON.stringify({
          msd: patientFound.factura,
          id_usuario: Number(user?.id || 0),
        }),
      });
      if (!entregaRes.ok) {
        const errText = await entregaRes.text();
        throw new Error("Error guardando medicamentos: " + errText);
      }

      const token = Cookies.get("medcol-user-token");
      console.log("🔑 Token recuperado de cookies:", token ? `${token.substring(0, 10)}...` : "vacio");

      const documentosRes = await fetch(
        `${baseUrl}/documentos/${pacienteData.id_paciente}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!documentosRes.ok) {
        const errorText = await documentosRes.text();
        throw new Error("Error subiendo documentos: " + errorText);
      }

      setIsSuccess(true);
      setCapturedImages({});
      setPatientFound(null);
      setMedicamentos([]); // Limpia también los medicamentos
      form.reset();
    } catch (error: any) {
      console.error("❌ Error en guardado:", error);
      setDocumentError(error?.message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };


  // Limpiar stream de cámara cuando se desmonta
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Redirigir si el usuario es externo
  useEffect(() => {
    if (user?.role === "externo") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchType: "factura",
      searchTerm: "",
    },
  });


  useEffect(() => {
    async function fetchTiposDocumento() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${baseUrl}/tipo-documentos`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setTiposDocumento(data);
        } else {
          console.error("📦 Los tipos de documento no son un array:", data);
          setTiposDocumento([]);
        }
      } catch (error) {
        console.error("❌ Error cargando tipos de documento:", error);
        setTiposDocumento([]);
      }
    }
    fetchTiposDocumento();
  }, []);

  const searchPatient = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoadingPatients(true);
      setErrorPatients(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        throw new Error("La variable NEXT_PUBLIC_API_URL no está definida");
      }

      let url = "";

      if (data.searchType === "factura") {
        url = `${baseUrl}/integracion-rfast/datos?factura=${encodeURIComponent(
          data.searchTerm
        )}`;
      } else {
        url = `${baseUrl}/integracion-rfast/datos?id_documento=${encodeURIComponent(
          data.searchTerm
        )}`;
      }

      console.log("🌍 URL consultada:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("No se pudo obtener información del paciente");
      }

      const result = await response.json();
      console.log("📦 Resultado del backend:", result);

      const patientsData = Array.isArray(result.data)
        ? result.data
        : result.data
          ? [result.data]
          : [];

      setPatients(patientsData);

      if (patientsData.length > 0) {
        const pacienteValido = patientsData.find(
          (p: any) => p.paciente && p.tipodocument && p.idusuario
        );

        if (pacienteValido) {
          setPatientFound(pacienteValido);
          setMedicamentos(pacienteValido.medicamentos || []);
        } else {
          setPatientFound(null);
          setErrorPatients(
            "No se encontró un paciente válido con datos completos."
          );
        }
      } else {
        setPatientFound(null);
        setErrorPatients(
          "No se encontró ningún paciente con los datos ingresados."
        );
      }
    } catch (error) {
      console.error("❌ Error buscando paciente:", error);
      setPatientFound(null);
      setPatients([]);
      setMedicamentos([]);
      setErrorPatients(
        "Error buscando paciente. Por favor intenta de nuevo."
      );
    } finally {
      setLoadingPatients(false);
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
              console.error("No se pudo iniciar el video:", error)
            );
        }
      }, 300); // esperar a que el modal renderice el <video>
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos."
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

      // Ajustar tamaño del canvas y capturar imagen
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");

      // Captura especial para cédula (ambas caras)
      if (currentDocumentType === "cedula") {
        if (!cedulaFront) {
          setCedulaFront(imageDataUrl);
          setShowBackAlert(true);
          return;
        } else {
          combineCedulaImages(cedulaFront, imageDataUrl);
          setCedulaFront(null);
          if (stream) stream.getTracks().forEach((track) => track.stop());
          setIsCameraOpen(false);
          return;
        }
      }

      // Documentos que aceptan múltiples capturas
      const tiposMultiples = [
        "msd",
        "formula",
        "tutela",
        "forean",
        "exoneracion",
        "portabilidad",
      ];

      if (tiposMultiples.includes(currentDocumentType)) {
        setCapturedImages((prev) => ({
          ...prev,
          [currentDocumentType]: [
            ...(prev[currentDocumentType] || []),
            imageDataUrl,
          ],
        }));
      } else {
        // Documentos únicos
        setCapturedImages((prev) => ({
          ...prev,
          [currentDocumentType]: imageDataUrl,
        }));
      }

      // Detener la cámara y cerrar modal
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (
      [
        "msd",
        "formula",
        "tutela",
        "forean",
        "exoneracion",
        "portabilidad",
      ].includes(documentType)
    ) {
      setUploadedFiles((prev) => ({
        ...prev,
        [documentType]: [...(prev[documentType] || []), ...files],
      }));
    } else if (files[0]) {
      setUploadedFiles((prev) => ({
        ...prev,
        [documentType]: files[0],
      }));
    }

    // Opcional: vista previa de MSD desde archivos
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = (event.target as FileReader)?.result;
        if (result) {
          setCapturedImages((prev) => {
            if (
              [
                "msd",
                "formula",
                "tutela",
                "forean",
                "exoneracion",
                "portabilidad",
              ].includes(documentType)
            ) {
              return {
                ...prev,
                [documentType]: [...(prev[documentType] || []), result],
              };
            }
            return { ...prev, [documentType]: result };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Función para eliminar un documento
  const removeDocument = (documentType: string) => {
    setCapturedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[documentType];
      return newImages;
    });

    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[documentType];
      return newFiles;
    });
  };

  // Función para previsualizar un documento
  const previewDocument = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setIsPreviewOpen(true);
  };

  // Función para guardar todos los documentos
  const saveAllDocuments = () => {
    const requiredDocs = ["cedula", "msd"];

    const missingDocs = requiredDocs.filter((doc) => {
      const captured = capturedImages[doc];
      const uploaded = uploadedFiles[doc];

      if (Array.isArray(captured)) return captured.length === 0;
      if (Array.isArray(uploaded)) return uploaded.length === 0;
      return !captured && !uploaded;
    });

    if (missingDocs.length > 0) {
      const labels: Record<string, string> = {
        cedula: "ID Card (Cédula)",
        autorizacion: "autorizacion",
        msd: "MSD",
      };
      const missingLabels = missingDocs.map((doc) => labels[doc]).join(", ");
      setDocumentError(
        `Faltan los siguientes documentos obligatorios: ${missingLabels}`
      );

      // Quitar el mensaje después de 4 segundos (ajustable)
      setTimeout(() => {
        setDocumentError(null);
      }, 4000);

      return;
    }

    setDocumentError(null);
    setIsSubmitting(true);
    savePacienteYDocumentos();

    setTimeout(() => {
      setIsSuccess(true);
      setIsSubmitting(false);

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
          Captura de Documentos
        </h1>
        <p className="text-muted-foreground">
          Sube documentos de dispensación de medicamentos
        </p>
      </div>

      {isSuccess && (
        <Dialog open={isSuccess} onOpenChange={(open) => setIsSuccess(open)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <div className="flex flex-col items-center justify-center">
                <Check className="h-10 w-10 text-green-600 mb-2" />
                <DialogTitle className="text-center">Éxito</DialogTitle>
                <DialogDescription className="text-center mt-2">
                  Los documentos han sido guardados correctamente.
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="flex justify-center pt-4">
              <Button onClick={() => setIsSuccess(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                            id="factura"
                            value="factura"
                            checked={field.value === "factura"}
                            onChange={() => field.onChange("factura")}
                            className="mr-1"
                          />
                          <label htmlFor="factura">MSD Number</label>{" "}
                          {/* 👈 Usuario ve "MSD Number" pero value es "factura" */}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="idusuario"
                            value="idusuario"
                            checked={field.value === "idusuario"}
                            onChange={() => field.onChange("idusuario")}
                            className="mr-1"
                          />
                          <label htmlFor="idusuario">ID Card (Cédula)</label>{" "}
                          {/* 👈 Usuario ve "Cédula" pero value es "idusuario" */}
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
                              placeholder={`Introduce ${form.getValues().searchType === "factura"
                                ? "MSD"
                                : "cédula"
                                }`}
                              className="pl-8"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e); // actualiza el valor del formulario
                                setErrorPatients(null); // limpia el mensaje de error
                              }}
                            />
                          </div>
                        </FormControl>
                        {errorPatients && (
                          <p className="text-red-500 text-sm mt-2">
                            {errorPatients}
                          </p>
                        )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Nombre Completo
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.paciente}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tipo de Documento
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.tipodocument}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Número de Documento
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.idusuario}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Ciudad</h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.ciudad}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Régimen</h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.regimen}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Médico</h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.medico}
                  </p>
                </div>
                {/*<div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Fecha de Suministro
                  </h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.fecha_suministro}
                  </p>
                </div>*/}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <p className="mt-1 text-lg font-medium">
                    {patientFound.estado}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Requeridos</CardTitle>
              <CardDescription>
                Sube o captura los siguientes documentos requeridos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Autorización */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">Autorización</h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara de la autorización
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("autorizacion-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="autorizacion-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("autorizacion", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera("autorizacion")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>
                {capturedImages["autorizacion"] && (
                  <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Autorización</p>
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
                            previewDocument(capturedImages["autorizacion"])
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeDocument("autorizacion")}
                        >
                          <Trash className="h-4 w-4 mr-1 text-red-500" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cédula */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">ID Card (Cédula)</h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara de la cédula
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("cedula-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="cedula-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("cedula", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera("cedula")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>
                {capturedImages["cedula"] && (
                  <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">Cédula</p>
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
                            previewDocument(capturedImages["cedula"])
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeDocument("cedula")}
                        >
                          <Trash className="h-4 w-4 mr-1 text-red-500" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fórmula Médica */}
              <div className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">Fórmula Médica</h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara de la fórmula médica
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("formula-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="formula-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      multiple
                      onChange={(e) => handleFileUpload("formula", e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera("formula")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>

                {Array.isArray(capturedImages["formula"]) ? (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {capturedImages["formula"].map(
                      (img: string, idx: number) => (
                        <div
                          key={idx}
                          className="relative bg-gray-50 p-4 rounded-md"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-8 w-8 text-blue-500 mr-2" />
                              <div>
                                <p className="font-medium">
                                  Fórmula #{idx + 1}
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
                                onClick={() => previewDocument(img)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCapturedImages((prev) => ({
                                    ...prev,
                                    formula: prev.formula.filter(
                                      (i: string) => i !== img
                                    ),
                                  }));
                                }}
                              >
                                <Trash className="h-4 w-4 mr-1 text-red-500" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  capturedImages["formula"] && (
                    <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-500 mr-2" />
                          <div>
                            <p className="font-medium">Fórmula Médica</p>
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
                              previewDocument(capturedImages["formula"])
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* MSD */}
              <div className="pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium">MSD</h3>
                    <p className="text-sm text-gray-500">
                      Sube o captura una imagen clara del MSD
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("msd-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="msd-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,pdf"
                      multiple
                      onChange={(e) => handleFileUpload("msd", e)}
                    />
                    <Button variant="outline" onClick={() => openCamera("msd")}>
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>
                </div>
                {Array.isArray(capturedImages["msd"]) ? (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {capturedImages["msd"].map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative bg-gray-50 p-4 rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium">MSD #{idx + 1}</p>
                              <p className="text-sm text-gray-500">
                                Documento capturado
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewDocument(img)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCapturedImages((prev) => ({
                                  ...prev,
                                  msd: prev.msd.filter(
                                    (i: string) => i !== img
                                  ),
                                }));
                              }}
                            >
                              <Trash className="h-4 w-4 mr-1 text-red-500" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  capturedImages["msd"] && (
                    <div className="mt-4 relative bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-500 mr-2" />
                          <div>
                            <p className="font-medium">MSD</p>
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
                              previewDocument(capturedImages["msd"])
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
              {mostrarOtrosDocumentos && (
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium mb-2">Otros Documentos</h3>
                  {/* selector de tipo */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Selecciona el tipo de documento:
                    </label>
                    <select
                      value={tipoDocumentoOtro}
                      onChange={(e) => setTipoDocumentoOtro(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
                    >
                      <option value="tutela">Tutela</option>
                      <option value="forean">Forean</option>
                      <option value="exoneracion">Carta de Exoneración</option>
                      <option value="portabilidad">Portabilidad</option>
                    </select>
                  </div>

                  {/* botones de acción */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("otros-upload")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir Archivo
                    </Button>
                    <input
                      id="otros-upload"
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(tipoDocumentoOtro, e)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => openCamera(tipoDocumentoOtro)}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Tomar Foto
                    </Button>
                  </div>

                  {/* muestra si se ha capturado */}
                  {Array.isArray(capturedImages[tipoDocumentoOtro]) ? (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {capturedImages[tipoDocumentoOtro].map(
                        (img: string, idx: number) => (
                          <div
                            key={idx}
                            className="relative bg-gray-50 p-4 rounded-md"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-8 w-8 text-blue-500 mr-2" />
                                <div>
                                  <p className="font-medium capitalize">
                                    {tipoDocumentoOtro} #{idx + 1}
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
                                  onClick={() => previewDocument(img)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Ver
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setCapturedImages((prev) => ({
                                      ...prev,
                                      [tipoDocumentoOtro]: prev[
                                        tipoDocumentoOtro
                                      ].filter((i: string) => i !== img),
                                    }))
                                  }
                                >
                                  <Trash className="h-4 w-4 mr-1 text-red-500" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    capturedImages[tipoDocumentoOtro] && (
                      <div className="relative bg-gray-50 p-4 rounded-md mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-500 mr-2" />
                            <div>
                              <p className="font-medium capitalize">
                                {tipoDocumentoOtro}
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
                                previewDocument(
                                  capturedImages[tipoDocumentoOtro]
                                )
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(tipoDocumentoOtro)}
                            >
                              <Trash className="h-4 w-4 mr-1 text-red-500" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/*<div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="pending-delivery"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={entregaPendiente}
                  onChange={(e) => setEntregaPendiente(e.target.checked)}
                />
                <label
                  htmlFor="pending-delivery"
                  className="text-sm font-medium text-gray-700"
                >
                  Marcar como entrega pendiente
                </label>
              </div>*/}

              {documentError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{documentError}</AlertDescription>
                </Alert>
              )}
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="mostrar-otros-docs"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={mostrarOtrosDocumentos}
                  onChange={(e) => setMostrarOtrosDocumentos(e.target.checked)}
                />
                <label
                  htmlFor="mostrar-otros-docs"
                  className="text-sm font-medium text-gray-700"
                >
                  Incluir Otros Documentos
                </label>
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

      {/* Diálogo para previsualización de documentos */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Previsualización de Documento</DialogTitle>
          </DialogHeader>

          <div className="flex justify-center">
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Documento"
              className="max-h-[500px] object-contain border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cerrar
            </Button>
            {previewImage && (
              <a href={previewImage} download="documento.png">
                <Button asChild>
                  <span>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar
                  </span>
                </Button>
              </a>
            )}
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
