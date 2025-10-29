export interface DashboardData {
  stats: Stats;
  recentReels: RecentReels[];
}

export interface RecentReels {
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
  scheduledReels: number;
  completedReels: number;
  todayReels: number;
}
