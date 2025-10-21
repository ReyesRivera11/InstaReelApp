import { DashboardModel } from "../models/dashboard.controller";

export const getDashboardDataService = async () => {
  const [
    activeClients,
    scheduledPublications,
    completedPublications,
    todayPublications,
    recentPublications,
  ] = await Promise.all([
    DashboardModel.getActiveClientsCount(),
    DashboardModel.getScheduledPublicationsCount(),
    DashboardModel.getCompletedPublicationsCount(),
    DashboardModel.getTodayPublicationsCount(),
    DashboardModel.getRecentPublications(5),
  ]);

  const stats = {
    activeClients,
    scheduledPublications,
    completedPublications,
    todayPublications,
  };

  const formattedPublications = recentPublications.map((pub) => ({
    id: pub.id,
    clientName: pub.client.name,
    scheduledFor: pub.scheduled_date,
    title: pub.title,
    description: pub.description,
    status: pub.status as "SCHEDULED" | "PUBLISHED",
    mediaUrl: pub.video_url || undefined,
    created_at: pub.created_at,
  }));

  return {
    stats,
    recentPublications: formattedPublications,
  };
};
