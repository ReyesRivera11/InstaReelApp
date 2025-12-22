import { XPublicationsModel } from "../models/xPublications.model"

export class XPublicationsService {
    static async list(params: {
        page: number
        limit: number
        search?: string
        status?: "SCHEDULED" | "PUBLISHED"
    }) {
        const { items, total } = await XPublicationsModel.getPaginated({
            ...params,
            status: params.status as any,
        })

        const totalPages = Math.ceil(total / params.limit)

        const publications = items.map((post) => ({
            id: post.id,
            client_id: post.client_id,
            clientName: `${post.client.name} (@${post.client.username})`,
            title: post.text,
            description: post.text,
            status: post.status,
            scheduled_date: post.scheduled_at,
            scheduled_at: post.scheduled_at,
            published_at: post.published_at,
            created_at: post.created_at,
        }))

        return {
            reels: publications,
            total,
            totalPages,
            hasNext: params.page < totalPages,
            hasPrev: params.page > 1,
        }
    }

    static async detail(id: number) {
        const post = await XPublicationsModel.getById(id)
        if (!post) return null

        return {
            id: post.id,
            client_id: post.client_id,
            clientName: `${post.client.name} (@${post.client.username})`,
            text: post.text,
            media_url: post.media_url,
            status: post.status,
            tweet_id: post.tweet_id,
            scheduled_at: post.scheduled_at,
            published_at: post.published_at,
            error_message: post.error_message,
            created_at: post.created_at,
        }
    }
}
