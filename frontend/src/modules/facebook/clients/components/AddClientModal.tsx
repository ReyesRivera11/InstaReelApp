"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Button } from "../../../../shared/components/ui/Button";
import { Input } from "../../../../shared/components/ui/Input";
import { Alert } from "../../../../shared/components/ui/Alert";
import { AlertCircle, CheckCircle, Facebook } from "lucide-react";
import { useApp } from "../../../../shared/hooks/useApp";

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
  const [pageName, setPageName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { setOauthCompleted } = useApp();

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    pageName?: string;
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

      if (event.data.type === "FACEBOOK_OAUTH_SUCCESS") {
        setSuccess(true);
        setTimeout(() => {
          handleReset();
          setOauthCompleted(true);
        }, 1500);
      } else if (event.data.type === "FACEBOOK_OAUTH_ERROR") {
        setError(event.data.error || "Error en la autenticación de Facebook");
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

  const validatePageName = (value: string) => {
    if (!value.trim()) return "Requerido";
    if (value.includes("@")) return "No debe incluir @";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 50) return "Máximo 50 caracteres";
    if (!/^[a-zA-Z0-9._-]+$/.test(value))
      return "Solo letras, números, puntos y guiones";
    return undefined;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setValidationErrors((prev) => ({ ...prev, name: error }));
  };

  const handlePageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageName(value);
    const error = validatePageName(value);
    setValidationErrors((prev) => ({ ...prev, pageName: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const pageError = validatePageName(pageName);

    if (nameError || pageError) {
      setValidationErrors({ name: nameError, pageName: pageError });
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    const clientData = {
      name,
      username: pageName,
      description,
    };
    localStorage.setItem("pending_client_fb", JSON.stringify(clientData));

    const oauthUrl =
      "https://www.facebook.com/dialog/oauth?" +
      new URLSearchParams({
        client_id: "25204565109180194",
        redirect_uri: "https://instareel-app.netlify.app/meta/callback-fb",
        response_type: "token",
        display: "popup",
        scope: [
          "public_profile",
          "pages_show_list",
          "pages_read_engagement",
          "pages_read_user_content",
          "pages_manage_posts",
          "pages_manage_engagement",
        ].join(","),
      }).toString();
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      oauthUrl,
      "facebook_oauth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  };

  const handleReset = () => {
    setName("");
    setPageName("");
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
          ¡Página de Facebook conectada exitosamente!
        </Alert>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Nuevo Cliente de Facebook"
        description="Registra una nueva página de Facebook para gestionar"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="name"
              label="Nombre del Cliente"
              placeholder="Nombre de la empresa o marca"
              value={name}
              onChange={handleNameChange}
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Input
              id="pageName"
              label="Nombre de la Página"
              placeholder="nombre_pagina"
              value={pageName}
              onChange={handlePageNameChange}
              leftIcon={<span className="text-muted-foreground">@</span>}
            />
            {validationErrors.pageName && (
              <p className="text-sm text-red-600 mt-1">
                {validationErrors.pageName}
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
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30"
            >
              <Facebook />
              Conectar con Facebook
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
