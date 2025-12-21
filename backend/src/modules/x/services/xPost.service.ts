// xPost.service.ts
import fs from "fs"
import axios from "axios"
import { XMediaType } from "@prisma/client"
import type { Multer } from "multer";

import { XPostsModel } from "../models/xPosts.model"
import { getXAccessTokenByClient } from "./xTokens.service"

import { AppError } from "../../../core/errors/AppError"
import { HttpCode } from "../../../shared/enums/HttpCode"

/* ============================
   Constantes X API
============================ */
const X_API = "https://api.twitter.com/2"
const X_UPLOAD_API = "https://upload.twitter.com/1.1/media/upload.json"

export class XPostService {
    /* ============================
       Subir media a X
    ============================ */
    private static async uploadMedia(
        accessToken: string,
        filePath: string
    ): Promise<string> {
        try {
            const mediaData = fs.readFileSync(filePath).toString("base64")

            const response = await axios.post(
                X_UPLOAD_API,
                { media_data: mediaData },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )

            return response.data.media_id_string
        } catch (error: any) {
            console.error(
                "X MEDIA UPLOAD ERROR:",
                error?.response?.status,
                error?.response?.data
            )
            throw error
            throw new AppError({
                name: "XMediaUploadError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al subir media a X",
                details: {
                    message: error?.message,
                },
            })
        }
    }

    /* ============================
       Publicar Tweet
    ============================ */
    private static async publishPost(
        accessToken: string,
        text: string,
        mediaId?: string
    ) {
        try {
            return await axios.post(
                `${X_API}/tweets`,
                {
                    text,
                    ...(mediaId && {
                        media: {
                            media_ids: [mediaId],
                        },
                    }),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            )
        } catch (error: any) {
            throw new AppError({
                name: "XPublishError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al publicar el post en X",
                details: {
                    message: error?.message,
                    response: error?.response?.data,
                },
            })
        }
    }

    /* ============================
       PUBLICACIÓN PROGRAMADA
    ============================ */
    static async schedule({
        client_id,
        text,
        scheduled_at,
        media,
    }: {
        client_id: number
        text: string
        scheduled_at: Date
        media?: Express.Multer.File
    }) {
        let mediaUrl: string | null = null
        let mediaType: XMediaType | null = null

        if (media) {
            mediaUrl = media.path
            mediaType = media.mimetype.startsWith("video")
                ? XMediaType.VIDEO
                : XMediaType.IMAGE
        }

        try {
            return await XPostsModel.create({
                client_id,
                text,
                media_url: mediaUrl,
                media_type: mediaType,
                scheduled_at,
            })
        } catch (error: any) {
            throw new AppError({
                name: "XPostScheduleError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al programar el post en X",
                details: {
                    message: error?.message,
                },
            })
        }
    }

    /* ============================
       PUBLICAR POST EXISTENTE
       (usado por CRON)
    ============================ */
    static async publishNow(post: any): Promise<string> {
        const accessToken = await getXAccessTokenByClient(post.client_id)

        let mediaId: string | undefined

        if (post.media_url) {
            mediaId = await this.uploadMedia(
                accessToken,
                post.media_url
            )
        }

        const response = await this.publishPost(
            accessToken,
            post.text,
            mediaId
        )

        return response.data.data.id
    }

    /* ============================
       PUBLICACIÓN INMEDIATA
    ============================ */
    static async publishImmediate({
        client_id,
        text,
        media,
    }: {
        client_id: number
        text: string
        media?: Express.Multer.File
    }) {
        const accessToken = await getXAccessTokenByClient(client_id)

        let mediaId: string | undefined
        let mediaUrl: string | null = null
        let mediaType: XMediaType | null = null

        if (media) {
            mediaUrl = media.path
            mediaType = media.mimetype.startsWith("video")
                ? XMediaType.VIDEO
                : XMediaType.IMAGE

            mediaId = await this.uploadMedia(
                accessToken,
                media.path
            )
        }

        const response = await this.publishPost(
            accessToken,
            text,
            mediaId
        )

        const post = await XPostsModel.create({
            client_id,
            text,
            media_url: mediaUrl,
            media_type: mediaType,
            scheduled_at: new Date(),
        })

        await XPostsModel.markPublished(
            post.id,
            response.data.data.id
        )

        return post
    }
}
