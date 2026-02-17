"use client";

import { useEffect, useState } from "react";
import { string, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  MoreVertical,
  Edit,
  Trash,
  Upload,
} from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllUsers } from "@/lib/users";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/footer";

// Schema para creación de usuarios
const userFormSchema = z.object({
  nombre: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  usuario: z
    .string()
    .min(2, { message: "El usuario debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Correo electrónico no válido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  rol: z.enum(["admin", "user", "externo"]),
  cargo: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

// Schema para editar usuarios
const editUserFormSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  usuario: z
    .string()
    .min(2, "El usuario debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().email("Correo electrónico no válido").optional(),
  //password: z.string().min(6, "La contraseña debe tener al menos 15 caracteres").optional(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Debe tener al menos 6 caracteres",
    }),
  rol: z.enum(["admin", "user", "externo"]).optional(),
  cargo: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

interface Usuario {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: "admin" | "user" | "externo";
  cargo: string;
  status: "active" | "inactive";
  usuario: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  //Formulario para creación de usuario
  const createForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      rol: "user",
      cargo: "",
      status: "active",
      usuario: "",
    },
  });

  // Formulario para edición de usuario
  const editForm = useForm<z.infer<typeof editUserFormSchema>>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {},
  });

  const fetchUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  function handleAddUser() {
    createForm.reset();
    setIsAddDialogOpen(true);
  }

  if (user?.role !== "admin") {
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

  function handleEditUser(user: Usuario) {
    setCurrentUser(user);
    editForm.reset({
      nombre: user.nombre,
      usuario: user.usuario,
      email: user.email,
      password: "", // Por seguridad, no mostramos la contraseña
      rol: user.rol,
      cargo: user.cargo,
    });
    setIsEditDialogOpen(true);
  }

  const onEditSubmit = async (values: z.infer<typeof editUserFormSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = Cookies.get("medcol-user-token");
      if (!token) throw new Error("Token no disponible");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser?.id_usuario}/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: values.nombre,
            usuario: values.usuario,
            email: values.email,
            //password: values.password || undefined,
            ...(values.password && { pass: values.password }),
            rol: values.rol,
            cargo: values.cargo,
            status: values.status,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar el usuario");

      const data = await response.json();

      console.log("🔄 Nuevo usuario actualizado:", data.user);

      // Refrescar la lista de usuarios local
      setUsers((prev) =>
        prev.map((u) =>
          u.id_usuario === data.user.id_usuario ? { ...u, ...data.user } : u
        )
      );
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      setIsEditDialogOpen(false);
    } catch (err: any) {
      console.error(err);
      setError("No se pudo actualizar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleDeleteUser(user: Usuario) {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  }

  // Funcion para activar usarios inactivos
  const handleActivateUser = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const success = await inactivateUser(userId, "active"); // usa el mismo endpoint con status 'active'
      if (success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id_usuario === userId ? { ...u, status: "active" } : u
          )
        );
      }
    } catch (error) {
      console.error("Error activando usuario:", error);
      setError("Ocurrió un error al activar el usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = Cookies.get("medcol-user-token");
      if (!token) throw new Error("Token de autenticación no encontrado");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            usuario: values.usuario,
            password: values.password,
            email: values.email,
            nombre: values.nombre,
            rol: values.rol,
            cargo: values.cargo || "Sin cargo",
            status: values.status || "active", // si ya agregaste el campo
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear usuario");

      // Agregar usuario al estado
      setUsers((prev) => [
        ...prev,
        {
          id_usuario: data.user.id_usuario,
          usuario: data.user.usuario,
          nombre: data.user.nombre,
          email: data.user.email,
          rol: data.user.rol,
          cargo: data.user.cargo,
          status: data.user.status || "active",
        },
      ]);

      setIsAddDialogOpen(false);
      createForm.reset();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inactivateUser = async (
    userId: string,
    status: "active" | "inactive"
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error actualizando el estado del usuario:", error);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestión de Usuarios
        </h1>
        <p className="text-muted-foreground">
          Administra cuentas de usuario y permisos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>
            Ver y gestionar todos los usuarios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value ?? "")}
              />
            </div>
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Usuario
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo electrónico</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id_usuario}>
                      <TableCell className="font-medium">
                        {user.nombre}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.usuario}</TableCell>
                      <TableCell>{user.cargo}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.rol === "admin"
                              ? "default"
                              : user.rol === "externo"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {user.rol === "admin"
                            ? "Administrador"
                            : user.rol === "externo"
                              ? "Externo"
                              : "Usuario"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "secondary"
                          }
                          className={
                            user.status === "active" ? "bg-green-500" : ""
                          }
                        >
                          {user.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Actualizar
                            </DropdownMenuItem>

                            {user.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Inactivar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleActivateUser(user.id_usuario)
                                }
                                className="text-green-600"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Activar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron usuarios.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo Añadir Usuario */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crear una nueva cuenta de usuario en el sistema
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el nombre"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el usuario"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el correo electrónico"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingresa la contraseña"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa el cargo"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Usuario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Usuario */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Actualizar Usuario</DialogTitle>
            <DialogDescription>
              Actualizar información de la cuenta de usuario
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Introduce correo electrónico"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Introduce nombre de usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Introduce nueva contraseña (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dejar vacío para mantener la contraseña actual
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce cargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo inactivar Usuario */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Inactivar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres Inactivar este usuario? Esta acción
              no eliminará la cuenta, pero deshabilitará su acceso.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="py-4">
            <p className="mb-2">
              <strong>Nombre:</strong> {currentUser?.nombre}
            </p>
            <p className="mb-2">
              <strong>Correo electrónico:</strong> {currentUser?.email}
            </p>
            <p>
              <strong>Cargo:</strong> {currentUser?.cargo}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                console.log(
                  "🧪 Clic detectado para inactivar usuario:",
                  currentUser
                );

                if (!currentUser?.id_usuario) {
                  console.log("❌ ID de usuario no definido");
                  return;
                }

                setIsSubmitting(true);

                try {
                  const success = await inactivateUser(
                    String(currentUser.id_usuario),
                    "inactive"
                  );
                  console.log("✅ Resultado de inactivateUser:", success);

                  if (success) {
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id_usuario === currentUser.id_usuario
                          ? { ...u, status: "inactive" }
                          : u
                      )
                    );
                    setIsDeleteDialogOpen(false);
                  } else {
                    setError("Ocurrió un error al inactivar el usuario.");
                  }
                } catch (err) {
                  console.error("❌ Error inactivando usuario:", err);
                  setError("Error inesperado al inactivar el usuario.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inactivando..." : "Inactivar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}

import Cookies from "js-cookie";
