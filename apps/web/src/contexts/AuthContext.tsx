import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { fetchApi } from "../lib/api";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial mount: check if session cookie is valid
    async function verifySession() {
      try {
        const data = await fetchApi("/auth/me");
        if (data.success && data.data?.user) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        // We only care if it's not a generic network failure
        // A 401 just means they are not logged in.
        setUser(null);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (credentials: any) => {
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const signup = async (credentials: any) => {
    try {
      const data = await fetchApi("/auth/signup", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      if (data.success && data.data?.user) {
        setUser(data.data.user);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, setUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
