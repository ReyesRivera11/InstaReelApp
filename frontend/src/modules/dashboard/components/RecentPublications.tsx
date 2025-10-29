import type { RecentReels } from "../../../core/types/dashboard.types";

interface RecentPublicationsProps {
  publications: RecentReels[];
}

export function RecentPublications({ publications }: RecentPublicationsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "PUBLISHED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "PROGRAMADO";
      case "PUBLISHED":
        return "PUBLICADO";
      default:
        return status;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold">Publicaciones Recientes</h2>
        <p className="text-sm text-muted-foreground">
          Últimas publicaciones programadas y completadas
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {publications?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                Sin actividad
              </p>
              <p className="text-sm text-muted-foreground">
                No hay publicaciones registradas. Comienza programando tu primer
                contenido.
              </p>
            </div>
          ) : (
            publications?.map((pub) => (
              <div
                key={pub.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-medium line-clamp-1">{pub.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {pub.clientName}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(pub.scheduledFor).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(pub.scheduledFor).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      pub.status
                    )}`}
                  >
                    {getStatusText(pub.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
