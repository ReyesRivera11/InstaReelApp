import prisma from "../../../shared/lib/prisma";

export class DashboardModel {
  static async getActiveClientsCount(): Promise<number> {
    return await prisma.client.count();
  }

  static async getScheduledReelsCount(): Promise<number> {
    return await prisma.reels.count({
      where: { 
        status: "SCHEDULED",
        scheduled_date: { gte: new Date() }
      }
    });
  }

  static async getCompletedReelsCount(): Promise<number> {
    return await prisma.reels.count({
      where: { status: "PUBLISHED" }
    });
  }

  static async getTodayReelsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.reels.count({
      where: {
        status: "PUBLISHED",
        scheduled_date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
  }

  static async getRecentReels(limit: number = 5) {
    return await prisma.reels.findMany({
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