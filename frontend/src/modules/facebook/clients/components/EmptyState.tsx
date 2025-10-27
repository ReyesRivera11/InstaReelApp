"use client";

import { Button } from "../../../../shared/components/ui/Button";

interface EmptyStateProps {
  onAddClient: () => void;
}

export function EmptyState({ onAddClient }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          No hay clientes aún
        </h3>
        <p className="text-muted-foreground">
          Comienza agregando tu primera página de Facebook para gestionar su
          contenido
        </p>
        <Button
          onClick={onAddClient}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30"
        >
          Agregar Primera Página
        </Button>
      </div>
    </div>
  );
}
