"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Instagram } from "lucide-react";
import { Alert, Button, Card, Input } from "../../../shared/components/ui";
import { useApp } from "../../../shared/hooks/useApp";
import { apiClient } from "../../../shared/services/api/apiClients";
import { storage } from "../../../shared/services/storage/localStorage";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
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

      <Card className="w-full max-w-md shadow-xl">
        <div className="p-6 space-y-4 text-center border-b border-border">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <Instagram className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reels Manager</h1>
            <p className="text-muted-foreground">
              Gestiona y programa tus publicaciones de Instagram
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
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
              <label htmlFor="password" className="text-sm font-medium">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
