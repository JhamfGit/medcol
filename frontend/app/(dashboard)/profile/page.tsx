"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/auth-context";
import { Check, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({
    message: "Por favor, introduce una dirección de correo electrónico válida",
  }),
  position: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    newPassword: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function ProfilePage() {
  const { user } = useAuth();
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.nombre || "",
      email: user?.email || "",
      position: user?.cargo || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsProfileSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(values);
      setProfileSuccess(true);

      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProfileSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsPasswordSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(values);
      setPasswordSuccess(true);

      setTimeout(() => {
        setPasswordSuccess(false);
        passwordForm.reset();
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPasswordSubmitting(false);
    }
  }

  // Verificar si el usuario es externo o regular (no admin)
  const isReadOnly = user?.role === "externo" || user?.role === "user";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">
          {isReadOnly
            ? "Visualiza la información de tu cuenta"
            : "Gestiona la configuración de tu cuenta y preferencias"}
        </p>
      </div>

      {isReadOnly && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Acceso Limitado</AlertTitle>
          <AlertDescription>
            Solo los administradores pueden modificar la información del perfil.
            Si necesitas realizar cambios, contacta a un administrador.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {!isReadOnly && (
            <TabsTrigger value="password">Contraseña</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                {isReadOnly
                  ? "Visualiza tu información personal"
                  : "Actualiza tu información personal"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-medium">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.position}
                  </p>
                </div>
              </div>

              {profileSuccess && (
                <Alert className="bg-green-50">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Éxito</AlertTitle>
                  <AlertDescription>
                    Tu perfil ha sido actualizado correctamente.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre"
                            {...field}
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu correo electrónico"
                            {...field}
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu cargo"
                            {...field}
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                          />
                        </FormControl>
                        <FormDescription>
                          Tu rol o cargo en la organización
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isReadOnly && (
                    <Button type="submit" disabled={isProfileSubmitting}>
                      {isProfileSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {!isReadOnly && (
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener tu cuenta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordSuccess && (
                  <Alert className="mb-6 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle>Éxito</AlertTitle>
                    <AlertDescription>
                      Tu contraseña ha sido actualizada correctamente.
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña Actual</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Introduce la contraseña actual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Introduce la nueva contraseña"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirma la nueva contraseña"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isPasswordSubmitting}>
                      {isPasswordSubmitting
                        ? "Actualizando..."
                        : "Actualizar Contraseña"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
