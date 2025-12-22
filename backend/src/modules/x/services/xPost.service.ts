import fs from "fs"
import fsp from "fs/promises"
import path from "path"
import axios from "axios"
import type { Multer } from "multer"
import { XMediaType } from "@prisma/client"

import { XPostsModel } from "../models/xPosts.model"
import { getXAccessTokenByClient } from "./xTokens.service"

import { supabaseAdmin } from "../../../shared/lib/supabaseAdmin"
import { AppError } from "../../../core/errors/AppError"
import { HttpCode } from "../../../shared/enums/HttpCode"

/* ============================
   Constantes X API
============================ */
const X_API = "https://api.twitter.com/2"

/* ============================
   Helpers
============================ */
const detectMediaType = (mimetype: string): XMediaType =>
    mimetype.startsWith("video") ? XMediaType.VIDEO : XMediaType.IMAGE

/**
 * Construye el texto final del tweet incluyendo URL externa si hay media.
 * Asegura límite 280 (aprox). Nota: X cuenta URLs con longitud fija, pero aquí
 * hacemos un recorte seguro para no pasar el límite de UI.
 */
const buildTweetText = (text: string, mediaUrl?: string | null) => {
    if (!mediaUrl) return text.trim()

    const suffix = `\n\n${mediaUrl}`

    // recorte simple a 280 caracteres (suficiente para evitar errores del lado UI)
    const baseMax = 280 - suffix.length
    const trimmed = text.trim()

    if (baseMax <= 0) return mediaUrl // extremo raro
    if (trimmed.length <= baseMax) return trimmed + suffix

    return trimmed.slice(0, Math.max(0, baseMax - 1)).trimEnd() + "…" + suffix
}

/* ============================
   Subir media a Supabase Storage
============================ */
const uploadToSupabaseStorage = async (file: Express.Multer.File) => {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "x-media"
    const ext = path.extname(file.originalname || "")
    const safeExt = ext && ext.length <= 8 ? ext : ""
    const objectPath = `x/${Date.now()}-${file.filename}${safeExt}`

    const buffer = fs.readFileSync(file.path)

    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(objectPath, buffer, {
            contentType: file.mimetype,
            upsert: false,
        })

    if (error) {
        throw new AppError({
            name: "SupabaseUploadError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error al subir archivo a Supabase Storage",
            details: { message: error.message, bucket, objectPath },
        })
    }

    // URL pública (requiere bucket público)
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath)

    const publicUrl = data?.publicUrl
    if (!publicUrl) {
        throw new AppError({
            name: "SupabasePublicUrlError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "No se pudo obtener URL pública del archivo",
            details: { bucket, objectPath },
        })
    }

    return publicUrl
}

/* ============================
   Publicar Tweet (solo /2/tweets)
============================ */
const publishPost = async (accessToken: string, text: string) => {
    try {
        return await axios.post(
            `${X_API}/tweets`,
            { text },
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
                status: error?.response?.status,
                response: error?.response?.data,
            },
        })
    }
}

/* ============================
   Servicio principal (CLASE)
============================ */
export class XPostService {
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

        try {
            // 📦 Subir media a Supabase Storage
            if (media) {
                mediaType = detectMediaType(media.mimetype)
                mediaUrl = await uploadToSupabaseStorage(media)
            }

            // 🧹 Limpiar archivo temporal local
            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { })
            }

            // ✅ Crear post programado (status se asigna internamente)
            return await XPostsModel.create({
                client_id,
                text,
                media_url: mediaUrl,
                media_type: mediaType,
                scheduled_at,
            })
        } catch (error: any) {
            // 🧹 Limpiar aunque haya error
            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { })
            }

            if (error instanceof AppError) throw error

            throw new AppError({
                name: "XPostScheduleError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al programar el post en X",
                details: { message: error?.message },
            })
        }
    }


    /**
     * Se usa por CRON: toma un post DB (con media_url ya externa)
     * y lo publica como texto + URL
     */
    static async publishNow(post: any): Promise<string> {
        const accessToken = await getXAccessTokenByClient(post.client_id)
        const tweetText = buildTweetText(post.text, post.media_url ?? null)

        const response = await publishPost(accessToken, tweetText)
        return response.data.data.id
    }

    /**
     * Publicación inmediata:
     * - si hay media: se sube a Supabase Storage y se publica URL junto al texto
     * - se guarda DB como PUBLISHED
     */
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

        let mediaUrl: string | null = null
        let mediaType: XMediaType | null = null

        try {
            if (media) {
                mediaType = detectMediaType(media.mimetype)
                mediaUrl = await uploadToSupabaseStorage(media)
            }

            // limpiar archivo temporal local
            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { })
            }

            const tweetText = buildTweetText(text, mediaUrl)
            const response = await publishPost(accessToken, tweetText)

            const post = await XPostsModel.create({
                client_id,
                text,
                media_url: mediaUrl,
                media_type: mediaType,
                scheduled_at: new Date(),
            })

            await XPostsModel.markPublished(post.id, response.data.data.id)
            return post
        } catch (error: any) {
            // limpiar aunque haya error
            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { })
            }

            if (error instanceof AppError) throw error

            throw new AppError({
                name: "XPostImmediateError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al publicar inmediatamente en X",
                details: { message: error?.message },
            })
        }
    }
}
