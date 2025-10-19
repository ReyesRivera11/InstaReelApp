export interface DashboardData {
  currentClients: number;
  scheduledCount: number;
  publishedCount: number;
  todayCount: number;
  recentPublications: RecentPublication[];
}

export interface RecentPublication {
  id: string;
  title: string;
  clientName: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "failed";
}
