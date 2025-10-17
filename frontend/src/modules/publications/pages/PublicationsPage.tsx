import { useState } from "react";
import type { Publication } from "../../../core/types";
import { PublicationDetailModal } from "../components/PublicationDetailModal";
import { useApp } from "../../../shared/hooks/useApp";

type ViewMode = "table" | "calendar";

export function PublicationsPage() {
  const { publications, clients } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPublication(null);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client
      ? `${client.name} (@${client.instagramHandle})`
      : "Cliente desconocido";
  };

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

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(pub.clientId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || pub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedPublications = [...filteredPublications].sort((a, b) => {
    return (
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  });

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
    return filteredPublications.filter((pub) => {
      const pubDate = new Date(pub.scheduledDate);
      return (
        pubDate.getDate() === date.getDate() &&
        pubDate.getMonth() === date.getMonth() &&
        pubDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const renderCalendarView = () => {
    const { daysInMonth, startDayOfWeek, year, month } =
      getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-32 p-2 border border-border bg-muted/30"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const pubs = getPublicationsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`min-h-32 p-2 border border-border bg-card hover:bg-accent/50 transition-colors ${
            isToday ? "ring-2 ring-purple-500" : ""
          }`}
        >
          <div
            className={`text-sm mb-2 ${
              isToday ? "text-purple-600" : "text-muted-foreground"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {pubs.slice(0, 3).map((pub) => {
              const client = clients.find((c) => c.id === pub.clientId);
              return (
                <div
                  key={pub.id}
                  onClick={() => handleViewDetails(pub)}
                  className={`text-xs p-2 rounded-md border-l-2 cursor-pointer hover:scale-105 transition-transform ${
                    pub.status === "scheduled"
                      ? "bg-blue-50 border-blue-500 hover:bg-blue-100"
                      : pub.status === "published"
                      ? "bg-green-50 border-green-500 hover:bg-green-100"
                      : "bg-red-50 border-red-500 hover:bg-red-100"
                  }`}
                >
                  <p className="line-clamp-1">{pub.title}</p>
                  <p className="text-muted-foreground line-clamp-1 mt-0.5">
                    {client?.name}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {new Date(pub.scheduledDate).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
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
            <div
              key={day}
              className="p-2 text-center text-sm text-muted-foreground"
            >
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Historial de Publicaciones</h1>
          <p className="text-muted-foreground">
            Visualiza y administra todas tus publicaciones programadas
          </p>
        </div>

        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
              viewMode === "table"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
              viewMode === "calendar"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
          >
            <svg
              className="w-4 h-4"
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
            Calendario
          </button>
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
              placeholder="Buscar por título, descripción o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="published">Publicado</option>
              <option value="failed">Fallido</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === "table" && (
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2>{sortedPublications.length} Publicaciones</h2>
            <p className="text-sm text-muted-foreground">
              Listado completo de todas tus publicaciones
            </p>
          </div>
          <div className="p-6">
            {sortedPublications.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" />
                </svg>
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
                      <th className="text-left p-4 text-sm">Título</th>
                      <th className="text-left p-4 text-sm">Cliente</th>
                      <th className="text-left p-4 text-sm">
                        Fecha Programada
                      </th>
                      <th className="text-left p-4 text-sm">Estado</th>
                      <th className="text-right p-4 text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPublications.map((pub) => (
                      <tr
                        key={pub.id}
                        className="border-b border-border hover:bg-accent/50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="line-clamp-1">{pub.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {pub.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {getClientName(pub.clientId)}
                          </p>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm">
                              {new Date(pub.scheduledDate).toLocaleDateString(
                                "es-ES",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(pub.scheduledDate).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(pub.status)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewDetails(pub)}
                            className="px-3 py-1 text-sm hover:bg-accent rounded-lg transition-colors"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "calendar" && (
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2>
                  {currentDate.toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Vista de calendario de publicaciones programadas
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={previousMonth}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="15 18 9 12 15 6" strokeWidth="2" />
                  </svg>
                </button>
                <button
                  onClick={nextMonth}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="9 18 15 12 9 6" strokeWidth="2" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                >
                  Hoy
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renderCalendarView()}

            <div className="flex gap-4 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-l-2 border-blue-500 bg-blue-50"></div>
                <span className="text-sm text-muted-foreground">
                  Programado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-l-2 border-green-500 bg-green-50"></div>
                <span className="text-sm text-muted-foreground">Publicado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-l-2 border-red-500 bg-red-50"></div>
                <span className="text-sm text-muted-foreground">Fallido</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicationDetailModal
        publication={selectedPublication}
        client={clients.find((c) => c.id === selectedPublication?.clientId)}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
