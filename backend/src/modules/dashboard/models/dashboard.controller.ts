import prisma from "../../../shared/lib/prisma";

export class DashboardModel {
  static async getActiveClientsCount(): Promise<number> {
    return await prisma.client.count();
  }

  static async getScheduledPublicationsCount(): Promise<number> {
    return await prisma.instagram_reels.count({
      where: { 
        status: "SCHEDULED",
        scheduled_date: { gte: new Date() }
      }
    });
  }

  static async getCompletedPublicationsCount(): Promise<number> {
    return await prisma.instagram_reels.count({
      where: { status: "PUBLISHED" }
    });
  }

  static async getTodayPublicationsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.instagram_reels.count({
      where: {
        status: "PUBLISHED",
        scheduled_date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  static async getRecentPublications(limit: number = 5) {
    return await prisma.instagram_reels.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        client: {
          select: { name: true }
        }
      }
    });
  }
}