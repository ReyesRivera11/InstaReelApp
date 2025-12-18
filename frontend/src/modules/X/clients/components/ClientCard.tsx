"use client";

import { useState } from "react";
import { Trash2, Pencil, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, Button, Card, CardContent, CardHeader, Modal } from "../../../../shared/components/ui";
import type { ClientDB } from "../../../../core/types";

// Logo 
const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
      setTimeout(() => setShowSuccessMessage(false), 4000);
    } catch (error) {
      setShowDeleteConfirm(false);
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo eliminar la cuenta"
      );
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 6000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className="w-full hover:shadow-lg transition-shadow duration-300 border-border">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Logo X */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 text-white dark:text-black border border-border">
              <XLogo className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate mt-1">
                @{client.username}
              </p>
              {client.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {client.description}
                </p>
              )}
            </div>

              <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(client)}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {client.description && (
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {client.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="¿Eliminar cuenta?"
        description={`Esta acción eliminará permanentemente la cuenta "${client.name}" (@${client.username}) y todos sus datos asociados. No se puede deshacer.`}
        maxWidth="sm"
      >
        <div className="flex gap-3 justify-end mt-6">
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
            {isDeleting ? "Eliminando..." : "Eliminar cuenta"}
          </Button>
        </div>
      </Modal>

      {/* Alertas flotantes */}
      {showSuccessMessage && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          La cuenta se eliminó correctamente
        </Alert>
      )}

      {showErrorMessage && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          <div>
            <p className="font-semibold">Error al eliminar</p>
            <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
          </div>
        </Alert>
      )}
    </>
  );
}