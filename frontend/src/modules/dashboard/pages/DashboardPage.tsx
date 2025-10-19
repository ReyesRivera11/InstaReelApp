import type { Publication, Client } from "../../../core/types";

interface DashboardPageProps {
  publications: Publication[];
  clients: Client[];
}

export function DashboardPage({ publications, clients }: DashboardPageProps) {
  const scheduledCount = publications.filter(
    (p) => p.status === "scheduled"
  ).length;
  const publishedCount = publications.filter(
    (p) => p.status === "published"
  ).length;
  const todayPublications = publications.filter((p) => {
    const pubDate = new Date(p.scheduledDate);
    const today = new Date();
    return pubDate.toDateString() === today.toDateString();
  });

  const recentPublications = publications
    .sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    )
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "published":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "published":
        return "Publicado";
      case "failed":
        return "Fallido";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de gestión de Instagram Reels
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-muted-foreground">Clientes Activos</h4>
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                strokeWidth="2"
              />
              <circle cx="9" cy="7" r="4" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-2xl">{clients.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cuentas de Instagram
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-muted-foreground">
              Publicaciones Programadas
            </h4>
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-2xl">{scheduledCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Pendientes de publicar
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-muted-foreground">Publicadas</h4>
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
              <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-2xl">{publishedCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total completadas
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-muted-foreground">Hoy</h4>
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
          </div>
          <div className="text-2xl">{todayPublications.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Publicaciones de hoy
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2>Publicaciones Recientes</h2>
          <p className="text-sm text-muted-foreground">
            Últimas publicaciones programadas y completadas
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentPublications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay publicaciones aún. ¡Programa tu primer reel!
              </p>
            ) : (
              recentPublications.map((pub) => {
                const client = clients.find((c) => c.id === pub.clientId);
                return (
                  <div
                    key={pub.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="line-clamp-1">{pub.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {client?.name || "Cliente desconocido"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusColor(
                          pub.status
                        )}`}
                      >
                        {getStatusText(pub.status)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
