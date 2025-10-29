import { DashboardModel } from "../models/dashboard.controller";

export const getDashboardDataService = async () => {
  const [
    activeClients,
    scheduledReels,
    completedReels,
    todayReels,
    recentReels,
  ] = await Promise.all([
    DashboardModel.getActiveClientsCount(),
    DashboardModel.getScheduledReelsCount(),
    DashboardModel.getCompletedReelsCount(),
    DashboardModel.getTodayReelsCount(),
    DashboardModel.getRecentReels(5),
  ]);

  const stats = {
    activeClients,
    scheduledReels,
    completedReels,
    todayReels,
  };

  const formattedReels = recentReels.map((reel) => ({
    id: reel.id,
    clientName: reel.client.name,
    scheduledFor: reel.scheduled_date,
    title: reel.title,
    description: reel.description,
    status: reel.status as "SCHEDULED" | "PUBLISHED",
    mediaUrl: reel.video_url || undefined,
    created_at: reel.created_at,
  }));

  return {
    stats,
    recentReels: formattedReels,
  };
};
