export interface DashboardData {
  stats: Stats;
  recentPublications: RecentPublication[];
}

export interface RecentPublication {
  id: number;
  clientName: string;
  scheduledFor: Date;
  title: string;
  description: string;
  status: string;
  mediaUrl: string;
  created_at: Date;
}

export interface Stats {
  activeClients: number;
  scheduledPublications: number;
  completedPublications: number;
  todayPublications: number;
}
