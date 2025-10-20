"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { AlertCircle } from "lucide-react";
import type { ClientDB, UpdateClientDTO } from "../../../core/types";
import { Button, Input, Textarea } from "../../../shared/components/ui";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateClientDTO) => Promise<void>;
  client: ClientDB | null;
}

export function EditClientModal({
  isOpen,
  onClose,
  onSubmit,
  client,
}: EditClientModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    username?: string;
    description?: string;
  }>({});

  useEffect(() => {
    if (client) {
      setName(client.name);
      setUsername(client.username);
      setDescription(client.description || "");
      setValidationErrors({});
    }
  }, [client]);

  const validateName = (value: string) => {
    if (!value.trim()) return "El nombre es requerido";
    if (value.length < 2) return "Mínimo 2 caracteres";
    if (value.length > 50) return "Máximo 50 caracteres";
    return undefined;
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) return "El usuario es requerido";
    if (value.includes("@")) return "No debe incluir @";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 30) return "Máximo 30 caracteres";
    if (!/^[a-zA-Z0-9._]+$/.test(value))
      return "Solo letras, números, puntos y guiones bajos";
    return undefined;
  };

  const validateDescription = (value: string) => {
    if (value.length > 500) return "Máximo 500 caracteres";
    return undefined;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setValidationErrors((prev) => ({ ...prev, name: error }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    const error = validateUsername(value);
    setValidationErrors((prev) => ({ ...prev, username: error }));
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setDescription(value);
    const error = validateDescription(value);
    setValidationErrors((prev) => ({ ...prev, description: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) return;

    const nameError = validateName(name);
    const usernameError = validateUsername(username);
    const descriptionError = validateDescription(description);

    if (nameError || usernameError || descriptionError) {
      setValidationErrors({
        name: nameError,
        username: usernameError,
        description: descriptionError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(client.id, {
        name: name.trim(),
        username: username.trim(),
        description: description.trim() || undefined,
      });
      handleReset();
      onClose();
    } catch (error) {
      console.error("Error updating client:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setUsername("");
    setDescription("");
    setValidationErrors({});
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  if (!client || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md mx-4 sm:max-w-[500px]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col space-y-1.5">
            <h2 className="text-lg font-semibold">Editar Cliente</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actualiza la información del cliente
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 sm:p-4 border rounded-lg flex gap-2 sm:gap-3 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 items-start">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">
              Ahora puedes editar el nombre, nombre de usuario y la descripción
              del cliente.
            </p>
          </div>

          {/* Campo para editar el nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nombre del Cliente
            </label>
            <Input
              id="name"
              placeholder="Nombre completo del cliente"
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
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
            >
              Usuario de Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                @
              </span>
              <Input
                id="username"
                placeholder="usuario_instagram"
                value={username}
                onChange={handleUsernameChange}
                className="pl-8"
              />
            </div>
            {validationErrors.username && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.username}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Descripción (opcional)
            </label>
            <Textarea
              id="description"
              placeholder="Breve descripción del cliente"
              value={description}
              onChange={handleDescriptionChange}
              rows={3}
            />
            {description.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {description.length}/500 caracteres
                {description.length > 500 && (
                  <span className="text-red-600 dark:text-red-400 ml-1">
                    - Máximo 500 caracteres
                  </span>
                )}
              </p>
            )}
            {validationErrors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
