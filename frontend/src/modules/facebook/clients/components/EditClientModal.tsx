"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Modal } from "../../../../shared/components/ui/Modal";
import { Input } from "../../../../shared/components/ui/Input";
import { Textarea } from "../../../../shared/components/ui/Textarea";
import { Button } from "../../../../shared/components/ui/Button";
import { Label } from "../../../../shared/components/ui/Label";
import type { ClientDB, UpdateClientDTO } from "../../../../core/types";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateClientDTO) => void;
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

  useEffect(() => {
    if (client) {
      setName(client.name);
      setUsername(client.username);
      setDescription(client.description || "");
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onSubmit(client.id, { name, username, description });
    }
  };

  if (!client) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente de Facebook">
      <p className="text-muted-foreground mb-6">
        Actualiza la información de la página de Facebook
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-name">Nombre del Cliente</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la empresa o marca"
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-username">Nombre de la Página</Label>
          <Input
            id="edit-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="nombre_pagina"
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-description">Descripción</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del cliente (opcional)"
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30"
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
