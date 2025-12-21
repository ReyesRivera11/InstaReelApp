"use client";

import { useState } from "react";
import { Card, Modal, Button, Alert } from "../../../../shared/components/ui";
import type { ClientDB } from "../../../../core/types";
import { Edit, Trash, CheckCircle, AlertCircle } from "lucide-react";

function TikTokIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor">
      <path d="M34.6 6c1.2 7 5.7 11.4 12.4 12.1v7.2c-4.1.1-7.7-1.2-10.9-3.4v14.6c0 8-6.5 14.5-14.5 14.5S7.1 44.5 7.1 36.5 13.6 22 21.6 22c.8 0 1.7.1 2.5.3v7.8c-.8-.3-1.6-.5-2.5-.5-3.6 0-6.6 2.9-6.6 6.6s2.9 6.6 6.6 6.6 6.6-2.9 6.6-6.6V6h7.8z" />
    </svg>
  );
}

interface ClientCardProps {
  client: ClientDB;
  onDelete: (id: number) => void;
  onEdit: (client: ClientDB) => void;
}

export function ClientCard({ client, onDelete, onEdit }: ClientCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(client.id);
      setShowDeleteConfirm(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      setShowDeleteConfirm(false);
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo eliminar el cliente"
      );
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-black/30">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center flex-shrink-0 shadow-lg">
            <TikTokIcon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {client.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              @{client.username}
            </p>
            {client.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {client.description}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(client)}
              className="p-2 hover:bg-black/5 rounded-lg transition-colors group hover:cursor-pointer"
              aria-label="Editar cliente"
            >
              <Edit className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group hover:cursor-pointer"
              aria-label="Eliminar cliente"
            >
              <Trash className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el cliente ${client.name} y todos sus datos asociados.`}
        maxWidth="sm"
      >
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </Modal>

      {showSuccessMessage && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          El cliente se eliminó correctamente
        </Alert>
      )}

      {showErrorMessage && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          <div>
            <p className="font-semibold">Error al eliminar</p>
            <p className="text-sm opacity-90">{errorMessage}</p>
          </div>
        </Alert>
      )}
    </>
  );
}
