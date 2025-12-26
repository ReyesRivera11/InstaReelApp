import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { XMediaType } from "@prisma/client";

import { XPostsModel } from "../models/xPosts.model";
import { XTokensService } from "./xTokens.service";
import { XMediaService } from "./xMedia.service";

import { supabaseAdmin } from "../../../shared/lib/supabaseAdmin";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

/* ============================
   OAuth 1.0a Client (global)
============================ */
const oauth = new OAuth({
    consumer: {
        key: process.env.X_API_KEY!,
        secret: process.env.X_API_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
        return crypto.createHmac("sha1", key).update(base_string).digest("base64");
    },
});

/* ============================
   Constantes
============================ */
const X_API_V2 = "https://api.x.com/2"; // Usado para /tweets
const X_UPLOAD_V1 = "https://upload.twitter.com/1.1"; // Media upload aún en v1.1

/* ============================
   Helper: Detectar tipo de media
============================ */
const detectMediaType = (mimetype: string): XMediaType =>
    mimetype.startsWith("video") ? XMediaType.VIDEO : XMediaType.IMAGE;

/* ============================
   Subir archivo a Supabase Storage
============================ */
const uploadToSupabaseStorage = async (file: Express.Multer.File) => {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "x-media";
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 8 ? ext : "";
    const objectPath = `x/${Date.now()}-${file.filename}${safeExt}`;

    const buffer = await fsp.readFile(file.path);

    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(objectPath, buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) {
        throw new AppError({
            name: "SupabaseUploadError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error al subir archivo a Supabase Storage",
            details: { message: error.message },
        });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);

    if (!data?.publicUrl) {
        throw new AppError({
            name: "SupabasePublicUrlError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "No se pudo obtener URL pública",
        });
    }

    return data.publicUrl;
};

/* ============================
   Publicar tweet usando OAuth 1.0a (recomendado para media)
============================ */
const postTweetWithOAuth1 = async (
    text: string,
    oauth1Token: string,
    oauth1Secret: string,
    mediaIds?: string[]
) => {
    const requestData = {
        url: `${X_API_V2}/tweets`,
        method: "POST",
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(requestData, {
            key: oauth1Token,
            secret: oauth1Secret,
        })
    );

    const payload: any = { text };
    if (mediaIds && mediaIds.length > 0) {
        payload.media = { media_ids: mediaIds };
    }

    const response = await axios.post(`${X_API_V2}/tweets`, payload, {
        headers: {
            ...authHeader,
            "Content-Type": "application/json",
            "User-Agent": "MyApp/1.0", // Recomendado por X
        },
    });

    return response.data.data.id;
};

/* ============================
   Publicar tweet de texto puro con OAuth 2.0 (opcional, más simple)
============================ */
const postTextTweetWithOAuth2 = async (
    accessToken: string,
    text: string
): Promise<string> => {
    console.log("[X OAUTH2] Intentando publicar tweet (texto)");

    try {
        const response = await axios.post(
            `${X_API_V2}/tweets`,
            { text },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const tweetId = response?.data?.data?.id;

        if (!tweetId) {
            console.error("[X OAUTH2] Respuesta sin tweet_id", response.data);
            throw new Error("X API no devolvió tweet_id");
        }

        console.log("[X OAUTH2] Tweet publicado correctamente", { tweetId });

        return tweetId;
    } catch (error: any) {
        console.error("[X OAUTH2] Error publicando tweet", {
            message: error?.message,
            response: error?.response?.data,
        });

        throw new AppError({
            name: "XOAuth2PublishFailed",
            httpCode: HttpCode.BAD_REQUEST,
            description: "Error publicando tweet con OAuth 2.0",
            details: error?.response?.data,
        });
    }
};



/* ============================
   Servicio principal
============================ */
export class XPostService {
    /* ============================
       Programar post
    ============================ */
    static async schedule({
        client_id,
        text,
        scheduled_at,
        media,
    }: {
        client_id: number;
        text: string;
        scheduled_at: Date;
        media?: Express.Multer.File;
    }) {
        console.log("[X SCHEDULE] Iniciando schedule", {
            clientId: client_id,
            hasMedia: !!media,
            scheduledAt: scheduled_at,
        });

        let mediaUrl: string | null = null;
        let mediaType: XMediaType | null = null;

        try {
            /* ============================
               Validación OAuth 1.0a si hay media
            ============================ */
            if (media) {
                console.log("[X SCHEDULE] Media detectada", {
                    mimetype: media.mimetype,
                    filename: media.originalname,
                });

                console.log("[X SCHEDULE] Validando OAuth 1.0a");
                const oauth1 = await XTokensService.getOAuth1Optional(client_id);

                if (!oauth1) {
                    console.error("[X SCHEDULE] OAuth 1.0a NO disponible");
                    throw new AppError({
                        name: "OAuth1Required",
                        httpCode: HttpCode.BAD_REQUEST,
                        description:
                            "Para programar publicaciones con imagen o video es necesario conectar OAuth 1.0a de X.",
                    });
                }

                console.log("[X SCHEDULE] OAuth 1.0a OK");

                mediaType = detectMediaType(media.mimetype);

                console.log("[X SCHEDULE] Subiendo media a Supabase");
                mediaUrl = await uploadToSupabaseStorage(media);

                console.log("[X SCHEDULE] Media subida a Supabase", {
                    mediaUrl,
                });
            }

            /* ============================
               Limpiar archivo temporal
            ============================ */
            if (media?.path) {
                await fsp.unlink(media.path).catch((e) => {
                    console.warn("[X SCHEDULE] Error limpiando archivo temporal", {
                        message: e?.message,
                    });
                });
            }

            console.log("[X SCHEDULE] Guardando post en DB");

            const post = await XPostsModel.create({
                client_id,
                text,
                media_url: mediaUrl,
                media_type: mediaType,
                scheduled_at,
            });

            console.log("[X SCHEDULE] Post programado correctamente", {
                postId: post.id,
            });

            return post;
        } catch (error: any) {
            console.error("[X SCHEDULE] Error al programar post", {
                message: error?.message,
                stack: error?.stack,
            });

            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { });
            }

            throw error instanceof AppError
                ? error
                : new AppError({
                    name: "XPostScheduleError",
                    httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                    description: "Error al programar post",
                    details: { message: error?.message },
                });
        }
    }


    /* ============================
       Publicar (decide si tiene media o no)
    ============================ */
    static async publish(post: any): Promise<string> {
        return post.media_url
            ? this.publishWithMedia(post)
            : this.publishText(post);
    }

    /* ============================
       Publicar solo texto (usando OAuth 2.0 si está disponible)
    ============================ */
    static async publishText(post: any): Promise<string> {
        console.log("[X POST] Publicar texto", {
            postId: post.id,
            clientId: post.client_id,
        });

        let tweetId: string | null = null;

        /* ============================
           1️⃣ OAuth 2.0 PRIMERO
        ============================ */
        const oauth2 = await XTokensService.getOAuth2Optional(post.client_id);

        if (oauth2?.access_token) {
            console.log("[X POST] Intentando OAuth 2.0");

            try {
                tweetId = await postTextTweetWithOAuth2(
                    oauth2.access_token,
                    post.text
                );
            } catch (error: any) {
                console.warn("[X POST] OAuth 2.0 falló, fallback a OAuth 1.0a", {
                    message: error?.message,
                });
            }
        } else {
            console.log("[X POST] OAuth 2.0 NO disponible");
        }

        /* ============================
           2️⃣ OAuth 1.0a (fallback)
        ============================ */
        if (!tweetId) {
            const oauth1 = await XTokensService.getOAuth1Optional(post.client_id);

            if (oauth1?.oauth1_token && oauth1?.oauth1_token_secret) {
                console.log("[X POST] Intentando OAuth 1.0a");

                tweetId = await postTweetWithOAuth1(
                    post.text,
                    oauth1.oauth1_token,
                    oauth1.oauth1_token_secret
                );
            } else {
                console.log("[X POST] OAuth 1.0a NO disponible");
            }
        }

        if (!tweetId) {
            throw new AppError({
                name: "MissingOAuthCredentials",
                httpCode: HttpCode.BAD_REQUEST,
                description:
                    "El cliente no tiene OAuth 2.0 ni OAuth 1.0a funcional",
            });
        }

        await XPostsModel.markPublished(post.id, tweetId);

        return tweetId;
    }


    /* ============================
       Publicar con media → TODO con OAuth 1.0a (más fiable)
    ============================ */
    static async publishWithMedia(post: any): Promise<string> {
        const oauth1 = await XTokensService.getOAuth1ByClient(post.client_id);

        if (!oauth1?.oauth1_token || !oauth1?.oauth1_token_secret) {
            throw new AppError({
                name: "MissingOAuth1",
                httpCode: HttpCode.BAD_REQUEST,
                description: "Faltan credenciales OAuth 1.0a para subir y publicar media",
            });
        }

        // 1. Subir media con OAuth 1.0a (v1.1 endpoint)
        const media = await XMediaService.uploadFromUrl({
            mediaUrl: post.media_url,
            mimeType: post.media_type === XMediaType.VIDEO ? "video/mp4" : "image/jpeg",
            creds: {
                oauth1_token: oauth1.oauth1_token,
                oauth1_token_secret: oauth1.oauth1_token_secret,
            },
        });

        // 2. Publicar tweet con el media_id usando OAuth 1.0a (v2 endpoint)
        const tweetId = await postTweetWithOAuth1(
            post.text,
            oauth1.oauth1_token,
            oauth1.oauth1_token_secret,
            [media.media_id_string]
        );

        // 3. Marcar como publicado
        await XPostsModel.markPublished(post.id, tweetId);

        return tweetId;
    }
}