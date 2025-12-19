"use client";

import { Plus } from "lucide-react";
import { Button, Card, CardContent } from "../../../../shared/components/ui";

// Logo 
const XLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface EmptyStateProps {
  onAddClient: () => void;
}

export function EmptyState({ onAddClient }: EmptyStateProps) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
        {/* Logo X */}
        <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black mb-6 border-2 border-border">
          <XLogo className="w-12 h-12" />
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-3">
          No tienes cuentas de X conectadas
        </h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md px-4">
          Comienza conectando tu primera cuenta para programar y gestionar publicaciones en X
        </p>

        <Button
          onClick={onAddClient}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Conectar primera cuenta
        </Button>
      </CardContent>
    </Card>
  );
}