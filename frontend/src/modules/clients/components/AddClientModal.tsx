"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Modal } from "../../../shared/components/ui/Modal";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Alert } from "../../../shared/components/ui/Alert";
import { Icons } from "../../../shared/components/icons";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useApp } from "../../../shared/hooks/useApp";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    username: string;
    description?: string;
  }) => Promise<void>;
}

export function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setOauthCompleted } = useApp();

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    instagramHandle?: string;
  }>({});

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "INSTAGRAM_OAUTH_SUCCESS") {
        setSuccess(true);
        setTimeout(() => {
          handleReset();
          // Set flag in context to trigger modal close and reload in parent
          setOauthCompleted(true);
        }, 1500);
      } else if (event.data.type === "INSTAGRAM_OAUTH_ERROR") {
        setError(event.data.error || "Error en la autenticación de Instagram");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setOauthCompleted]);

  const validateName = (value: string) => {
    if (!value.trim()) return "Requerido";
    if (value.length > 100) return "Máximo 100 caracteres";
    return undefined;
  };

  const validateInstagramHandle = (value: string) => {
    if (!value.trim()) return "Requerido";
    if (value.includes("@")) return "No debe incluir @";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-zA-Z0-9._]+$/.test(value))
      return "Solo letras, números, puntos y guiones bajos";
    return undefined;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setValidationErrors((prev) => ({ ...prev, name: error }));
  };

  const handleInstagramHandleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setInstagramHandle(value);
    const error = validateInstagramHandle(value);
    setValidationErrors((prev) => ({ ...prev, instagramHandle: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const handleError = validateInstagramHandle(instagramHandle);

    if (nameError || handleError) {
      setValidationErrors({ name: nameError, instagramHandle: handleError });
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    const clientData = {
      name,
      username: instagramHandle,
      description,
    };
    localStorage.setItem("pending_client", JSON.stringify(clientData));

    const oauthUrl =
      "https://www.facebook.com/dialog/oauth?" +
      new URLSearchParams({
        client_id: "25204565109180194",
        display: "page",
        redirect_uri: "https://instareel-app.netlify.app/meta/callback",
        response_type: "token",
        scope:
          "instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_show_list,pages_read_engagement",
        extras: JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } }),
      }).toString();

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      oauthUrl,
      "instagram_oauth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleReset = () => {
    setName("");
    setInstagramHandle("");
    setDescription("");
    setError(null);
    setSuccess(false);
    setValidationErrors({});
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Cliente agregado exitosamente!
        </Alert>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Nuevo Cliente"
        description="Registra una nueva cuenta de Instagram para gestionar"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg flex gap-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 items-start">
            <Icons.AlertCircle />
            <p className="text-sm">
              Al hacer clic en "Conectar con Instagram", se abrirá una ventana
              de autenticación OAuth. El backend obtendrá automáticamente el
              access token y el ID de Instagram.
            </p>
          </div>

          <div>
            <Input
              id="name"
              label="Nombre del Cliente"
              placeholder="Nombre de la empresa o marca"
              value={name}
              onChange={handleNameChange}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Input
              id="handle"
              label="Usuario de Instagram"
              placeholder="usuario_instagram"
              value={instagramHandle}
              onChange={handleInstagramHandleChange}
              leftIcon={<span className="text-muted-foreground">@</span>}
            />
            {validationErrors.instagramHandle && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.instagramHandle}
              </p>
            )}
          </div>

          <div>
            <Input
              id="description"
              label="Descripción"
              placeholder="Breve descripción del cliente (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {description.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {description.length}/500 caracteres{" "}
                {description.length > 500 && (
                  <span className="text-red-600 dark:text-red-400">
                    - Máximo 500 caracteres
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button type="submit">
              <Icons.Instagram />
              Conectar con Instagram
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
