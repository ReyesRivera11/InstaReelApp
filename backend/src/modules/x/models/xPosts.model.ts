import prisma from "../../../shared/lib/prisma";
import { XPostStatus } from "@prisma/client";

export class XPostsModel {
    static async create(data: {
        client_id: number;
        text: string;
        scheduled_at?: Date;
    }) {
        return prisma.x_posts.create({
            data: {
                ...data,
                status: XPostStatus.SCHEDULED,
            },
        });
    }

    static async getScheduledPosts() {
        return prisma.x_posts.findMany({
            where: {
                status: XPostStatus.SCHEDULED,
                scheduled_at: {
                    lte: new Date(),
                },
            },
            include: {
                client: true,
            },
        });
    }

    static async markAsPublished(postId: number, tweetId: string) {
        return prisma.x_posts.update({
            where: { id: postId },
            data: {
                status: XPostStatus.PUBLISHED,
                tweet_id: tweetId,
                published_at: new Date(),
            },
        });
    }

    static async markAsFailed(postId: number, error: string) {
        return prisma.x_posts.update({
            where: { id: postId },
            data: {
                status: XPostStatus.FAILED,
                error_message: error,
            },
        });
    }

    static async getByClientId(clientId: number) {
        return prisma.x_posts.findMany({
            where: { client_id: clientId },
            orderBy: { created_at: "desc" },
        });
    }
}
