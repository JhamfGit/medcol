"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

type User = {
  id: string;
  name: string;
  role: "admin" | "user" | "externo";
};

type AuthContextType = {
  user: User | null;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = Cookies.get("medcol-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error al leer los datos del usuario desde cookies:", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (usuario: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario, password }), // ✅ campo correcto
        }
      );

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();

      const userData: User = {
        id: data.user.id_usuario.toString(),
        name: data.user.nombre,
        role: data.user.rol ?? "user",
      };

      setUser(userData);
      Cookies.set("medcol-user", JSON.stringify(userData), { expires: 7 });
      Cookies.set("medcol-user-token", data.access_token, { expires: 7 }); // ✅ correcto

      //Cookies.set("medcol-user-token", data.token, { expires: 7 }); // almacenar el token para crear los usuarios
      return true;
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("medcol-user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
