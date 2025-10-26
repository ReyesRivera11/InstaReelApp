"use client";

import { useState, useEffect } from "react";
import type { Publication } from "../../../core/types";
import { appPublications } from "../../../shared/services/api/apiPublications";

interface PublicationDetailModalProps {
  publicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function PublicationDetailModal({
  publicationId,
  isOpen,
  onClose,
}: PublicationDetailModalProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      if (!publicationId || !isOpen) {
        setPublication(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await appPublications.getPublicationById(
          publicationId.toString()
        );
        console.log(response);
        if (response.publication) {
          setPublication(response.publication);
        } else {
          setError(response.error || "Error al cargar la publicación");
        }
      } catch {
        setError("Error al cargar los detalles de la publicación");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublication();
  }, [publicationId, isOpen]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-lg shadow-xl max-w-3xl w-full p-12"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-card rounded-lg shadow-xl max-w-3xl w-full p-12"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg
              className="w-12 h-12 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!publication) return null;

  const getScheduledDate = (pub: Publication): string | undefined => {
    return pub.scheduled_date ?? pub.scheduledDate ?? undefined;
  };

  const getVideoUrl = (pub: Publication): string | undefined => {
    return pub.media_url ?? pub.video_url ?? undefined;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No programado";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Hora inválida";
    }
  };

  const scheduledDate = getScheduledDate(publication);
  const videoUrl = getVideoUrl(publication);

  const getInstagramEmbedUrl = (url?: string) => {
    if (!url) return null;

    const reelMatch = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
    if (reelMatch && reelMatch[1]) {
      return `https://www.instagram.com/reel/${reelMatch[1]}/embed`;
    }
    return null;
  };

  const embedUrl = getInstagramEmbedUrl(videoUrl);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
      case "SCHEDULED":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            PROGRAMADO
          </span>
        );
      case "PUBLISHED":
      case "published":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            PUBLICADO
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const getClientName = () => {
    if (publication.clientName) {
      return publication.clientName;
    }
    return "Cliente desconocido";
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
              <h2 className="text-2xl font-bold">{publication.title}</h2>
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
              <p>{getClientName()}</p>
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
            {videoUrl ? (
              <div className="space-y-4">
                {embedUrl ? (
                  <div className="aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-purple-200 shadow-lg">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      scrolling="no"
                      allowTransparency={true}
                      allow="encrypted-media"
                    />
                  </div>
                ) : (
                  <div className="aspect-[9/16] max-w-sm mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border-2 border-purple-200 overflow-hidden">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                      <p className="text-sm text-purple-700 font-medium mb-2">
                        Vista previa del Reel
                      </p>
                      <p className="text-xs text-purple-600">
                        Haz clic en el botón para ver en Instagram
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line
                        x1="17.5"
                        y1="6.5"
                        x2="17.51"
                        y2="6.5"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Ver Reel en Instagram
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points="15 3 21 3 21 9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        y1="14"
                        x2="21"
                        y2="3"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
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
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"
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
              {publication.description || "Sin descripción"}
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
              <p className="text-sm font-medium">{formatDate(scheduledDate)}</p>
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
              <p className="text-sm font-medium">{formatTime(scheduledDate)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
