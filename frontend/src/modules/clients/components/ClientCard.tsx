"use client";

import {
  Card,
  CardHeader,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { Icons } from "../../../shared/components/icons";
import type { Client } from "../../../core/types";

interface ClientCardProps {
  client: Client;
  onDelete: (id: string) => void;
}

export function ClientCard({ client, onDelete }: ClientCardProps) {
  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
              <Icons.Instagram />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">
                  {client.name}
                </h3>
                {client.isAuthenticated && (
                  <Badge
                    variant="success"
                    className="flex items-center gap-1 flex-shrink-0"
                  >
                    <Icons.CheckCircle />
                    Conectado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                @{client.instagramHandle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(client.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 p-2"
          >
            <Icons.Trash />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {client.description}
          </p>
        )}
        {client.isAuthenticated && client.accessToken && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Credenciales conectadas:
            </p>
            <div className="flex items-center gap-2 overflow-hidden">
              <code className="text-xs bg-background px-2 py-1 rounded border border-border truncate">
                Token: {client.accessToken.substring(0, 20)}...
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
