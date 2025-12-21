"use client";

import type React from "react";
import { useState } from "react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { Input } from "../../../../shared/components/ui/Input";
import { Alert } from "../../../../shared/components/ui/Alert";
import { AlertCircle } from "lucide-react";

interface AddTikTokClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTikTokClientModal({
  isOpen,
  onClose,
}: AddTikTokClientModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const validateName = (v: string) =>
    !v.trim() ? "El nombre es requerido" : undefined;

  const validateUsername = (v: string) => {
    if (!v.trim()) return "El usuario es requerido";
    if (!/^[a-zA-Z0-9._-]+$/.test(v)) return "Usuario inválido";
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const usernameError = validateUsername(username);

    if (nameError || usernameError) {
      setError(nameError || usernameError || "Formulario inválido");
      return;
    }

    try {
      setIsRedirecting(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tiktok/prepare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            name,
            username,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.state) {
        throw new Error("No se pudo iniciar TikTok");
      }

      window.location.href =
        `${import.meta.env.VITE_API_URL}/tiktok/auth?state=${data.state}`;
    } catch {
      setIsRedirecting(false);
      setError("Error al iniciar conexión con TikTok");
    }
  };

  const handleCancel = () => {
    setName("");
    setUsername("");
    setDescription("");
    setError(null);
    onClose();
  };

  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle />}>
          {error}
        </Alert>
      )}

      <Modal isOpen={isOpen} onClose={onClose} title="Conectar cuenta de TikTok">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del cliente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Usuario de TikTok"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/@|\s/g, ""))
            }
            leftIcon={<span>@</span>}
            required
          />

          <Input
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={isRedirecting}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isRedirecting}>
              {isRedirecting ? "Redirigiendo..." : "Conectar TikTok"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
