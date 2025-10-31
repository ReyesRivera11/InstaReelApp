"use client";

import {
  Trash2,
  Instagram,
  Pencil,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Modal,
} from "../../../../shared/components/ui";
import type { ClientDB } from "../../../../core/types";

interface ClientCardProps {
  client: ClientDB;
  onDelete: (id: number) => Promise<void>;
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
      <Card className="w-full hover:shadow-md transition-shadow">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
              <Instagram className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{client.username}
              </p>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(client)}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 sm:h-9 sm:w-9"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {client.description && (
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {client.description}
            </p>
          </CardContent>
        )}
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
