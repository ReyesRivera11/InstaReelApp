import cron from "node-cron"
import { XPostsModel } from "../models/xPosts.model"
import { XPostService } from "../services/xPost.service"

export const startXPostCron = () => {
    cron.schedule("* * * * *", async () => {
        console.log("[X CRON] Ejecutando cron de publicaciones X")

        try {
            const pendingPosts = await XPostsModel.getPending()

            if (!pendingPosts.length) {
                console.log("[X CRON] No hay posts pendientes")
                return
            }

            console.log(`[X CRON] ${pendingPosts.length} post(s) pendientes`)

            for (const post of pendingPosts) {
                try {
                    console.log(`[X CRON] Publicando post ID ${post.id}`)

                    const tweetId = await XPostService.publish(post)

                    await XPostsModel.markPublished(post.id, tweetId)

                    console.log(
                        `[X CRON] Post ${post.id} publicado correctamente (${tweetId})`
                    )
                } catch (error: any) {
                    console.error(
                        `[X CRON] Error publicando post ${post.id}`,
                        error?.message
                    )

                    await XPostsModel.markFailed(
                        post.id,
                        error?.message || "Error desconocido al publicar"
                    )
                }
            }
        } catch (error) {
            console.error("[X CRON] Error general del cron", error)
        }
    })
}
