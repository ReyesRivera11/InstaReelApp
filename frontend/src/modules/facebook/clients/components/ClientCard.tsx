"use client";

import { useState } from "react";
import { Card, Modal, Button, Alert } from "../../../../shared/components/ui";
import type { ClientDB } from "../../../../core/types";
import { Edit, Trash, CheckCircle2, XCircle } from "lucide-react";

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(client.id);
      setShowDeleteConfirm(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      setShowDeleteConfirm(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el cliente"
      );
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 border-gray-200 hover:border-blue-300">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
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
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
              aria-label="Editar cliente"
            >
              <Edit className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              aria-label="Eliminar cliente"
            >
              <Trash className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="¿Estás seguro?"
        description={`Esta acción no se puede deshacer. Se eliminará permanentemente el cliente ${client.name} y todos sus datos asociados.`}
        maxWidth="sm"
      >
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancelDelete}
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
        <Alert variant="success" icon={<CheckCircle2 className="w-5 h-5" />}>
          <div>
            <p className="font-semibold">Cliente eliminado</p>
            <p className="text-sm opacity-90">
              El cliente se eliminó correctamente
            </p>
          </div>
        </Alert>
      )}

      {showErrorMessage && (
        <Alert variant="error" icon={<XCircle className="w-5 h-5" />}>
          <div>
            <p className="font-semibold">Error al eliminar</p>
            <p className="text-sm opacity-90">{errorMessage}</p>
          </div>
        </Alert>
      )}
    </>
  );
}
