"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, Button, Card, Input } from "../../../shared/components/ui";
import { useApp } from "../../../shared/hooks/useApp";
import { storage } from "../../../shared/services/storage/localStorage";
import { apiClient } from "../../../shared/services/api/reels/apiClients";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { setIsAuthenticated, setUser, setCurrentPage } = useApp();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);
      storage.setToken(response.accessToken);
      setUser(response.user);
      setSuccess(true);

      setTimeout(() => {
        setCurrentPage("dashboard");
        setIsAuthenticated(true);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Inicio de sesión exitoso! Redirigiendo...
        </Alert>
      )}

      <Card className="w-full max-w-md shadow-2xl border border-gray-100">
        <div className="p-8 space-y-4 text-center border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="text-white w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Social Hub</h1>
            <p className="text-muted-foreground">
              Gestiona todas tus redes sociales en un solo lugar
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg hover:cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Conecta Instagram, Facebook, TikTok, WhatsApp y X
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
