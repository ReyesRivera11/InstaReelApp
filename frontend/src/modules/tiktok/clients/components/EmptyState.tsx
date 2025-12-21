"use client";

import { Button } from "../../../../shared/components/ui/Button";

interface EmptyStateProps {
  onAddClient: () => void;
}

function TikTokIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="currentColor">
      <path d="M34.6 6c1.2 7 5.7 11.4 12.4 12.1v7.2c-4.1.1-7.7-1.2-10.9-3.4v14.6c0 8-6.5 14.5-14.5 14.5S7.1 44.5 7.1 36.5 13.6 22 21.6 22c.8 0 1.7.1 2.5.3v7.8c-.8-.3-1.6-.5-2.5-.5-3.6 0-6.6 2.9-6.6 6.6s2.9 6.6 6.6 6.6 6.6-2.9 6.6-6.6V6h7.8z" />
    </svg>
  );
}

export function EmptyState({ onAddClient }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto shadow-lg">
          <TikTokIcon className="w-10 h-10 text-white" />
        </div>

        <h3 className="text-xl font-semibold text-foreground">
          No hay clientes aún
        </h3>

        <p className="text-muted-foreground">
          Comienza agregando tu primera cuenta de TikTok para gestionar contenido
        </p>

        <Button
          onClick={onAddClient}
          className="bg-black hover:bg-neutral-900 text-white shadow-lg"
        >
          Agregar Primera Cuenta
        </Button>
      </div>
    </div>
  );
}
