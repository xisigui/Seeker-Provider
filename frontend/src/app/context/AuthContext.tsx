"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/config";

interface User {
  id: number;
  email: string;
  role: "seeker" | "provider";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  role: "seeker" | "provider";
  location?: string;
  industry_preference?: string;
  service_focus?: string;
  name?: string;
  skills?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

//TODO: Fix bug where user should not be able to register if already logged in

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token on mount
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      // Validate token
      const validateToken = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/api/auth/validate",
            {
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.valid) {
            // Token is valid, set the user state
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } else {
            // Token is invalid, clear everything
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            window.location.href = "/auth/login";
          }
        } catch (error) {
          console.error("Token validation error:", error);
          // If there's an error, clear everything
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
          window.location.href = "/auth/login";
        } finally {
          setIsLoading(false);
        }
      };

      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with API URL:", config.apiUrl);
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.auth.login}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log("Attempting registration with API URL:", config.apiUrl);
      const response = await fetch(
        `${config.apiUrl}${config.endpoints.auth.register}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
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
