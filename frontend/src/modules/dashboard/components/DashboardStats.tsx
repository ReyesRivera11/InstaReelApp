interface DashboardStatsProps {
  currentClients: number
  scheduledCount: number
  publishedCount: number
  todayCount: number
}

export function DashboardStats({ currentClients, scheduledCount, publishedCount, todayCount }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-muted-foreground">Clientes Activos</h4>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" />
            <circle cx="9" cy="7" r="4" strokeWidth="2" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-2xl font-bold">{currentClients}</div>
        <p className="text-xs text-muted-foreground mt-1">Cuentas de Instagram</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-muted-foreground">Publicaciones Programadas</h4>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polyline points="12 6 12 12 16 14" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-2xl font-bold">{scheduledCount}</div>
        <p className="text-xs text-muted-foreground mt-1">Pendientes de publicar</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-muted-foreground">Publicadas</h4>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
            <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-2xl font-bold">{publishedCount}</div>
        <p className="text-xs text-muted-foreground mt-1">Total completadas</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm text-muted-foreground">Hoy</h4>
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
        </div>
        <div className="text-2xl font-bold">{todayCount}</div>
        <p className="text-xs text-muted-foreground mt-1">Publicaciones de hoy</p>
      </div>
    </div>
  )
}
