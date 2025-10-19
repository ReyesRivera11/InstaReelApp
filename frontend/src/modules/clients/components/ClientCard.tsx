"use client";

import { Trash2, Instagram } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui";
import type { ClientDB } from "../../../core/types";

interface ClientCardProps {
  client: ClientDB;
  onDelete: (id: string) => void;
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
              <Instagram className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg">
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{client.username}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(client.id.toString())}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0 h-9 w-9"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      {client.description && (
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">{client.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
