"use client";

import { useState, useEffect } from "react";

// 🔁 Servicios
import { apiXPublications } from "../../../../shared/services/api/x/apiXPublications";
import type { XPublication } from "../../../../core/types/publication.types";

interface PublicationDetailModalProps {
  publicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;

  /** 🆕 Identidad social */
  socialIdentity?: "X";
}

const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function PublicationDetailModal({
  publicationId,
  isOpen,
  onClose,
  socialIdentity = "X",
}: PublicationDetailModalProps) {
  const [publication, setPublication] = useState<XPublication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================
     FETCH PUBLICATION
  ============================ */
  useEffect(() => {
    const fetchPublication = async () => {
      if (!publicationId || !isOpen) {
        setPublication(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // 🐦 X
        if (socialIdentity === "X") {
          const response = await apiXPublications.getPublicationById(publicationId);

          if (response?.publication) {
            setPublication(response.publication);
          } else {
            setError("No se encontró la publicación");
          }
          return;
        }

      } catch {
        setError("Error al cargar los detalles de la publicación");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublication();
  }, [publicationId, isOpen, socialIdentity]);

  if (!isOpen) return null;

  /* ============================
     LOADING
  ============================ */
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full p-12" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Cargando detalles...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     ERROR
  ============================ */
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full p-12" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="w-12 h-12 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
            </svg>
            <p className="text-muted-foreground">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!publication) return null;

  /* ============================
     HELPERS
  ============================ */
  const scheduledDate = publication.scheduled_at ?? publication.published_at;

  const getTweetUrl = () => {
    if (!publication.tweet_id) return null;

    let username = publication.clientName;

    // Extraer @username si viene en formato "Nombre (@username)"
    if (username) {
      const match = username.match(/@([A-Za-z0-9_]+)/);
      if (match) {
        username = match[1];
      } else {
        // Limpieza básica por si acaso
        username = username.replace(/\s+/g, "");
      }
    }

    if (username) {
      return `https://x.com/${username}/status/${publication.tweet_id}`;
    }

    // Fallback universal
    return `https://x.com/i/web/status/${publication.tweet_id}`;
  };



  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      : "No programado";

  const formatTime = (date?: string) =>
    date
      ? new Date(date).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
      : "";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">PROGRAMADO</span>;
      case "PUBLISHED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">PUBLICADO</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  /* ============================
     UI
  ============================ */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <XLogo className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{publication.text}</h2>
              <p className="text-sm text-muted-foreground">
                Detalles completos de la publicación en X
              </p>
            </div>
          </div>
          {getStatusBadge(publication.status)}
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap">
            {publication.text || "Sin contenido"}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium">{formatDate(scheduledDate ?? undefined)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hora</p>
              <p className="font-medium">{formatTime(scheduledDate ?? undefined)}</p>
            </div>
          </div>

          {publication.status === "PUBLISHED" && getTweetUrl() && (
            <div className="text-center">
              <a
                href={getTweetUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <XLogo className="w-5 h-5" />
                Ver tweet en X
              </a>
            </div>
          )}


          <button onClick={onClose} className="w-full px-4 py-2 bg-black text-white rounded-lg">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
