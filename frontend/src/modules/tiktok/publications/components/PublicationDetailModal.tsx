"use client";

import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { apiTikTokReels } from "../../../../shared/services/api/tiktok/apiTikTokReels";

/* ================================
   Tipos
================================ */

interface TikTokReel {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  scheduled_at?: string;
  published_at?: string | null;
  status: string;
  error_message?: string | null;
}

/* ================================
   Props
================================ */

interface PublicationDetailModalProps {
  publicationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ================================
   Modal
================================ */

export function PublicationDetailModal({
  publicationId,
  isOpen,
  onClose,
}: PublicationDetailModalProps) {
  const [reel, setReel] = useState<TikTokReel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================================
     Cargar reel
  ================================ */
  useEffect(() => {
    if (!publicationId || !isOpen) {
      setReel(null);
      return;
    }

    const loadReel = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiTikTokReels.getScheduledReels({ limit: 50 });

        const found = res.data.reels.find(
          (r: TikTokReel) => r.id === publicationId
        );

        if (!found) {
          setError("No se encontró la publicación");
        } else {
          setReel(found);
        }
      } catch {
        setError("Error al cargar el detalle del reel");
      } finally {
        setLoading(false);
      }
    };

    loadReel();
  }, [publicationId, isOpen]);

  if (!isOpen) return null;

  /* ================================
     Helpers FECHA / HORA (SIN TZ BUG)
  ================================ */
  const formatDate = (value?: string) => {
    if (!value) return "—";

    try {
      const date = new Date(value); // interpreta UTC correctamente
      return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };


  const formatTime = (value?: string) => {
    if (!value) return "—";

    try {
      const date = new Date(value); // UTC → local
      return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // o false si prefieres 24h
      });
    } catch {
      return "—";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            PROGRAMADO
          </span>
        );
      case "PUBLISHED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            PUBLICADO
          </span>
        );
      case "FAILED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            FALLIDO
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  /* ================================
     Render
  ================================ */
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {reel?.title || "Detalle del Reel"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Publicación de TikTok
            </p>
          </div>

          {reel && getStatusBadge(reel.status)}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">
                Cargando…
              </p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle />
              <span>{error}</span>
            </div>
          )}

          {reel && (
            <>
              {/* Video */}
              {reel.video_url ? (
                <div className="aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
                  <video
                    src={reel.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No hay video disponible
                </p>
              )}
              
              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha programada
                  </p>
                  <p className="font-medium">
                    {formatDate(reel.scheduled_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Hora programada
                  </p>
                  <p className="font-medium">
                    {formatTime(reel.scheduled_at)}
                  </p>
                </div>
              </div>

              {/* Error */}
              {reel.status === "FAILED" && reel.error_message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <p className="font-medium">Error de publicación</p>
                  <p className="text-sm mt-1">{reel.error_message}</p>
                </div>
              )}

           {/* Descripción */}
{reel.description && (
  <div>
    <p className="text-sm text-muted-foreground">Descripción</p>
    <p className="mt-1 break-words whitespace-pre-wrap">
      {reel.description}
    </p>
  </div>
)}

            </>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
