"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Pencil, Trash2, Eye } from "lucide-react";

import { Button, Alert } from "../../../../shared/components/ui";
import { useApp } from "../../../../shared/hooks/useApp";

import { apiTikTokReels } from "../../../../shared/services/api/tiktok/apiTikTokReels";
import { PublicationDetailModal } from "../components/PublicationDetailModal";
import { EditTikTokReelModal } from "../components/EditTikTokReelModal";

/* ================================
   Tipos
================================ */
interface TikTokReel {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  video_url?: string;
  scheduled_at?: string;
  status: string;
  error_message?: string | null;
}

/* ================================
   Página
================================ */
export default function PublicationsPageTikTok() {
  const { clients } = useApp();

  const [reels, setReels] = useState<TikTokReel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editReel, setEditReel] = useState<TikTokReel | null>(null);
  const [deleteReel, setDeleteReel] = useState<TikTokReel | null>(null);

  /* ================================
     Debounce búsqueda
  ================================ */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ================================
     Cargar reels
  ================================ */
  const loadReels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await apiTikTokReels.getScheduledReels({
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        limit: 50,
      });

      setReels(res.data.reels || []);
    } catch {
      setError("Error al cargar publicaciones de TikTok");
      setReels([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  /* ================================
     Helpers
  ================================ */
  const getClientName = (id: number) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.name} (@${c.username})` : "Cliente desconocido";
  };

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
     Eliminar
  ================================ */
  const confirmDelete = async () => {
    if (!deleteReel) return;

    try {
      await apiTikTokReels.deleteReel(deleteReel.id);
      setDeleteReel(null);
      loadReels();
    } catch {
      setError("No se pudo eliminar el reel");
    }
  };

  /* ================================
     Render
  ================================ */
  return (
    <>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Publicaciones de TikTok</h1>
            <p className="text-muted-foreground">
              Gestión de reels programados y publicados
            </p>
          </div>

          <Button
            variant="gradient"
            onClick={async () => {
              setIsRefreshing(true);
              await loadReels();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            Recargar
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-card border rounded-lg p-4 flex gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título o descripción..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="SCHEDULED">Programado</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="FAILED">Fallido</option>
          </select>
        </div>
        {/* Tabla SIMÉTRICA y adaptable al contenido */}
        <div className="bg-card border rounded-lg overflow-hidden">
          {isLoading ? (
        <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-[#1877F2] rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando publicaciones...</p>
            </div>
          </div>
          ) : reels.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No hay publicaciones
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="p-4 text-left font-medium">Título</th>
                    <th className="p-4 text-left font-medium">Cliente</th>
                    <th className="p-4 text-left font-medium whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="p-4 text-left font-medium whitespace-nowrap">
                      Hora
                    </th>
                    <th className="p-4 text-left font-medium">Estado</th>
                    <th className="p-4 text-left font-medium whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {reels.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b last:border-b-0 hover:bg-muted/40 transition-colors"
                    >
                      {/* TÍTULO */}
                      <td className="p-4 max-w-[200px]">
                        <p className="font-medium truncate">{r.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {r.description}
                        </p>
                      </td>

                      {/* CLIENTE */}
                      <td className="p-4 whitespace-nowrap">
                        {getClientName(r.client_id)}
                      </td>

                      {/* FECHA */}
                      <td className="p-4 whitespace-nowrap">
                        {formatDate(r.scheduled_at)}
                      </td>

                      {/* HORA */}
                      <td className="p-4 whitespace-nowrap">
                        {formatTime(r.scheduled_at)}
                      </td>

                      {/* ESTADO */}
                      <td className="p-4">
                        <div className="inline-flex">
                          {getStatusBadge(r.status)}
                        </div>
                      </td>

                      {/* ACCIONES */}
                      <td className="p-4">
                        <div className="flex justify-start gap-2 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedId(r.id);
                              setDetailOpen(true);
                            }}
                          >
                            <Eye size={16} />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={r.status !== "SCHEDULED"}
                            onClick={() => setEditReel(r)}
                          >
                            <Pencil size={16} />
                          </Button>
<Button
  variant="destructive"
  size="sm"
  onClick={() => setDeleteReel(r)}
>
  <Trash2 size={16} />
</Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <PublicationDetailModal
        publicationId={selectedId}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <EditTikTokReelModal
        reel={editReel}
        isOpen={!!editReel}
        onClose={() => setEditReel(null)}
        onUpdated={loadReels}
      />

       {/* Confirmar eliminar */}
      {deleteReel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Eliminar reel</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Seguro que deseas eliminar <b>{deleteReel.title}</b>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteReel(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
