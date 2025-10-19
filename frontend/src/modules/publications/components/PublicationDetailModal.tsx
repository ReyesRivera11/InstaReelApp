import type { Publication, ClientDB } from "../../../core/types";

interface PublicationDetailModalProps {
  publication: Publication | null;
  client: ClientDB | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicationDetailModal({
  publication,
  client,
  isOpen,
  onClose,
}: PublicationDetailModalProps) {
  if (!publication || !isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
            Programado
          </span>
        );
      case "published":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            Publicado
          </span>
        );
      case "failed":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            Fallido
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2>{publication.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Detalles completos de la publicación programada
              </p>
            </div>
            {getStatusBadge(publication.status)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  ry="5"
                  strokeWidth="2"
                />
                <path
                  d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="7" r="4" strokeWidth="2" />
                </svg>
                <span className="text-sm text-muted-foreground">Cliente</span>
              </div>
              <p>{client?.name || "Cliente desconocido"}</p>
              <p className="text-sm text-muted-foreground">
                @{client?.username}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2" />
                <rect
                  x="1"
                  y="5"
                  width="15"
                  height="14"
                  rx="2"
                  ry="2"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-sm text-muted-foreground">
                Video del Reel
              </span>
            </div>
            {publication.videoUrl ? (
              <div className="relative aspect-[9/16] max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  src={publication.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            ) : (
              <div className="aspect-[9/16] max-w-sm mx-auto bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 text-muted-foreground mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2" />
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    No hay video disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  strokeWidth="2"
                />
                <polyline points="14 2 14 8 20 8" strokeWidth="2" />
                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" />
                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" />
                <polyline points="10 9 9 9 8 9" strokeWidth="2" />
              </svg>
              <span className="text-sm text-muted-foreground">
                Descripción / Caption
              </span>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
              {publication.description}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    ry="2"
                    strokeWidth="2"
                  />
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
                <span className="text-sm text-muted-foreground">
                  Fecha Programada
                </span>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                {new Date(publication.scheduledDate).toLocaleDateString(
                  "es-ES",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                </svg>
                <span className="text-sm text-muted-foreground">
                  Hora Programada
                </span>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                {new Date(publication.scheduledDate).toLocaleTimeString(
                  "es-ES",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cerrar
            </button>
            <button
              disabled={publication.status !== "scheduled"}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Editar
            </button>
            <button
              disabled={publication.status === "published"}
              className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar Publicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
