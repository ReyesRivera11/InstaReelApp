"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Reels,           // Cambiar 
  ReelsFilters,    
  PaginatedReels,  
} from "../../../../core/types";

import { AlertCircle, CheckCircle, X, RefreshCw } from "lucide-react";
import { useApp } from "../../../../shared/hooks/useApp";
import { Alert, Button } from "../../../../shared/components/ui";
import { PublicationDetailModal } from "../components/PublicationDetailModal";
import { appReelss } from "../../../../shared/services/api/reels/apiPublications";

const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

type ViewMode = "table" | "calendar";

const PublicationsPageX = () => {
  const { clients } = useApp();
  const [publications, setPublications] = useState<Reels[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPublicationId, setSelectedPublicationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPublications, setTotalPublications] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadPublications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filters: ReelsFilters = {
        page: currentPage,
        limit: itemsPerPage,
        social_identity: "INSTAGRAM",
      };

      if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
      if (statusFilter !== "all") filters.status = statusFilter as "SCHEDULED" | "PUBLISHED";

      const response: PaginatedReels = await appReelss.getReelss(filters);
      if (response.reels && Array.isArray(response.reels)) {
        setPublications(response.reels);
        setTotalPages(response.totalPages);
        setTotalPublications(response.total);
        setHasNext(response.hasNext);
        setHasPrev(response.hasPrev);
      } else {
        setPublications([]);
        setError("Error al cargar las publicaciones");
      }
    } catch (err) {
      setPublications([]);
      setError(err instanceof Error ? err.message : "Error al cargar las publicaciones");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadPublications();
      setSuccess(true);
    } catch {
      setError("Error al recargar las publicaciones");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadPublications();
    }
  }, [debouncedSearchTerm, statusFilter]);

  const getScheduledDate = (pub: Reels): string | undefined => {
    return pub.scheduled_date ?? pub.scheduledDate ?? undefined;
  };

  const sortedPublications = Array.isArray(publications)
    ? [...publications].sort((a, b) => {
        const dateA = getScheduledDate(a) ? new Date(getScheduledDate(a)!).getTime() : 0;
        const dateB = getScheduledDate(b) ? new Date(getScheduledDate(b)!).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const getPublicationsForDate = (date: Date) => {
    if (!Array.isArray(publications)) return [];

    return publications.filter((pub) => {
      const scheduledDate = getScheduledDate(pub);
      if (!scheduledDate) return false;

      const pubDate = new Date(scheduledDate);
      return (
        pubDate.getDate() === date.getDate() &&
        pubDate.getMonth() === date.getMonth() &&
        pubDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatPublicationDate = (pub: Reels) => {
    const dateString = getScheduledDate(pub);
    if (!dateString) return "No programado";

    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatPublicationTime = (pub: Reels) => {
    const dateString = getScheduledDate(pub);
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

  const renderCalendarView = () => {
    const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-32 p-2 border border-border bg-muted/30"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const pubs = getPublicationsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-32 p-2 border border-border bg-card hover:bg-accent/50 transition-colors ${isToday ? "ring-2 ring-black" : ""}`}
        >
          <div className={`text-sm mb-2 ${isToday ? "text-black font-bold" : "text-muted-foreground"}`}>
            {day}
          </div>
          <div className="space-y-1">
            {pubs.slice(0, 3).map((pub) => (
              <div
                key={pub.id}
                onClick={() => handleViewDetails(pub)}
                className={`text-xs p-2 rounded-md border-l-4 cursor-pointer hover:scale-105 transition-transform ${
                  pub.status === "SCHEDULED"
                    ? "bg-yellow-50 border-yellow-500 hover:bg-yellow-100"
                    : "bg-green-50 border-green-500 hover:bg-green-100"
                }`}
              >
                <p className="line-clamp-1 font-medium">
                  {pub.description || pub.title || "Sin contenido"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {pub.clientName || "Cuenta desconocida"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPublicationTime(pub)}
                </p>
              </div>
            ))}
            {pubs.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                +{pubs.length - 3} más
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-0 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0 border border-border">
          {days}
        </div>
      </div>
    );
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Mostrando {publications.length} de {totalPublications} publicaciones
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="11 17 6 12 11 7" strokeWidth="2" />
              <polyline points="18 17 13 12 18 7" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" strokeWidth="2" />
            </svg>
          </button>

          {startPage > 1 && (
            <>
              <button onClick={() => setCurrentPage(1)} className="px-3 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                1
              </button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? "bg-black text-white border-black"
                  : "border-border hover:bg-accent"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNext}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={!hasNext}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="13 17 18 12 13 7" strokeWidth="2" />
              <polyline points="6 17 11 12 6 7" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const handleViewDetails = (publication: Reels) => {
    setSelectedPublicationId(publication.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPublicationId(null);
  };

  const getClientName = (publication: Reels) => {
    if (publication.clientName) return publication.clientName;
    const client = clients.find((c) => c.id === publication.client_id);
    return client ? `${client.name} (@${client.username})` : "Cuenta desconocida";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">PROGRAMADO</span>;
      case "PUBLISHED":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">PUBLICADO</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const handleClearSearch = () => setSearchTerm("");

  return (
    <>
      {error && <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>{error}</Alert>}
      {success && <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>¡Publicaciones actualizadas!</Alert>}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <XLogo className="w-12 h-12" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Historial de Publicaciones en X
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualiza y administra todas tus publicaciones programadas en X
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Recargando..." : "Recargar"}
            </Button>

            <div className="flex gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  viewMode === "table" ? "bg-background shadow-sm" : "hover:bg-background/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2" />
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2" />
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2" />
                </svg>
                Tabla
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  viewMode === "calendar" ? "bg-background shadow-sm" : "hover:bg-background/50"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                </svg>
                Calendario
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" />
              </svg>
              <input
                placeholder="Buscar por texto, descripción o cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="all">Todos los estados</option>
                <option value="SCHEDULED">Programado</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando publicaciones...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "table" && (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <h2 className="text-xl font-semibold">
                    {totalPublications} Publicaciones
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Listado completo de todas tus publicaciones en X
                  </p>
                </div>
                <div className="p-6">
                  {sortedPublications.length === 0 ? (
                    <div className="text-center py-12">
                      <XLogo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all"
                          ? "No se encontraron publicaciones con los filtros aplicados"
                          : "No hay publicaciones programadas aún"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-4 text-sm font-medium">Texto</th>
                            <th className="text-left p-4 text-sm font-medium">Cuenta</th>
                            <th className="text-left p-4 text-sm font-medium">Fecha Programada</th>
                            <th className="text-left p-4 text-sm font-medium">Estado</th>
                            <th className="text-right p-4 text-sm font-medium">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedPublications.map((pub) => (
                            <tr key={pub.id} className="border-b border-border hover:bg-accent/50">
                              <td className="p-4">
                                <div>
                                  <p className="line-clamp-2 font-medium">
                                    {pub.title || "Sin título"}
                                  </p>
                                  {pub.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                      {pub.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <p className="text-sm">{getClientName(pub)}</p>
                              </td>
                              <td className="p-4">
                                <div>
                                  <p className="text-sm">{formatPublicationDate(pub)}</p>
                                  <p className="text-sm text-muted-foreground">{formatPublicationTime(pub)}</p>
                                </div>
                              </td>
                              <td className="p-4">{getStatusBadge(pub.status)}</td>
                              <td className="p-4 text-right">
                                <Button
                                  onClick={() => handleViewDetails(pub)}
                                  className="bg-black hover:bg-gray-800 text-white"
                                >
                                  Ver detalles
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {renderPaginationControls()}
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="bg-card rounded-lg border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold capitalize">
                        {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Vista de calendario de publicaciones programadas en X
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={previousMonth}
                        className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="15 18 9 12 15 6" strokeWidth="2" />
                        </svg>
                      </button>
                      <button
                        onClick={nextMonth}
                        className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="9 18 15 12 9 6" strokeWidth="2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {renderCalendarView()}
                  <div className="flex gap-4 mt-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-l-4 border-yellow-500 bg-yellow-50"></div>
                      <span className="text-sm text-muted-foreground">Programado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-l-4 border-green-500 bg-green-50"></div>
                      <span className="text-sm text-muted-foreground">Publicado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <PublicationDetailModal
          publicationId={selectedPublicationId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={loadPublications}
        />
      </div>
    </>
  );
};

export default PublicationsPageX;