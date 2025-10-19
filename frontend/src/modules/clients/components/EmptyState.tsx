"use client";

import { Button } from "../../../shared/components/ui/Button";
import { Icons } from "../../../shared/components/icons";
import { Card, CardContent } from "../../../shared/components/ui/Card";

interface EmptyStateProps {
  onAddClient: () => void;
}

export function EmptyState({ onAddClient }: EmptyStateProps) {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white mb-4">
          <Icons.Instagram />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No tienes clientes registrados
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Comienza agregando tu primer cliente para gestionar sus publicaciones
          de Instagram
        </p>
        <Button onClick={onAddClient} variant="outline">
          <Icons.Plus />
          Agregar tu primer cliente
        </Button>
      </CardContent>
    </Card>
  );
}
