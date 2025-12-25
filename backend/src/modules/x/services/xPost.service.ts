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
   OAuth 1.0a client (X)
============================ */
const oauth = new OAuth({
    consumer: {
        key: process.env.X_API_KEY!,
        secret: process.env.X_API_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
        return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    },
});

/* ============================
   Constantes
============================ */
const X_API_V2 = "https://api.twitter.com/2";
const X_API_V1 = "https://api.twitter.com/1.1";

/* ============================
   Helpers
============================ */
const detectMediaType = (mimetype: string): XMediaType =>
    mimetype.startsWith("video") ? XMediaType.VIDEO : XMediaType.IMAGE;

/* ============================
   Supabase upload
============================ */
const uploadToSupabaseStorage = async (file: Express.Multer.File) => {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "x-media";
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 8 ? ext : "";
    const objectPath = `x/${Date.now()}-${file.filename}${safeExt}`;

    const buffer = fs.readFileSync(file.path);

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
            details: { message: error.message, bucket, objectPath },
        });
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath);

    if (!data?.publicUrl) {
        throw new AppError({
            name: "SupabasePublicUrlError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "No se pudo obtener URL pública del archivo",
            details: { bucket, objectPath },
        });
    }

    return data.publicUrl;
};

/* ============================
   Tweet texto (OAuth 2.0)
============================ */
const publishTextTweet = async (accessToken: string, text: string) => {
    try {
        const resp = await axios.post(
            `${X_API_V2}/tweets`,
            { text },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return resp.data.data.id;
    } catch (error: any) {
        throw new AppError({
            name: "XPublishTextError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error al publicar tweet de texto en X",
            details: {
                status: error?.response?.status,
                response: error?.response?.data,
            },
        });
    }
};

/* ============================
   Servicio principal
============================ */
export class XPostService {
    /* ============================
       Crear post programado
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
        let mediaUrl: string | null = null;
        let mediaType: XMediaType | null = null;

        try {
            if (media) {
                mediaType = detectMediaType(media.mimetype);
                mediaUrl = await uploadToSupabaseStorage(media);
            }

            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { });
            }

            return await XPostsModel.create({
                client_id,
                text,
                media_url: mediaUrl,
                media_type: mediaType,
                scheduled_at,
            });
        } catch (error: any) {
            if (media?.path) {
                await fsp.unlink(media.path).catch(() => { });
            }

            if (error instanceof AppError) throw error;

            throw new AppError({
                name: "XPostScheduleError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al programar el post en X",
                details: { message: error?.message },
            });
        }
    }

    /* ============================
       Publicar (CRON / inmediato)
       Decide texto vs media
    ============================ */
    static async publish(post: any): Promise<string> {
        if (post.media_url) {
            return this.publishWithMedia(post);
        }

        return this.publishText(post);
    }

    /* ============================
       Tweet solo texto (OAuth 2.0)
    ============================ */
    static async publishText(post: any): Promise<string> {
        const token = await XTokensService.getOAuth2ByClient(post.client_id);
        const accessToken =
            typeof token === "string" ? token : token.access_token;

        const tweetId = await publishTextTweet(accessToken!, post.text);

        await XPostsModel.markPublished(post.id, tweetId);
        return tweetId;
    }

    /* ============================
       Tweet con media (OAuth 1.0a)
    ============================ */
    static async publishWithMedia(post: any): Promise<string> {
        // 1️⃣ OAuth 1.0a
        const oauth1 = await XTokensService.getOAuth1ByClient(post.client_id);

        // 2️⃣ Subir media a X
        const media = await XMediaService.uploadFromUrl({
            mediaUrl: post.media_url,
            mimeType: post.media_type === XMediaType.VIDEO ? "video/mp4" : "image/jpeg",
            creds: {
                oauth1_token: oauth1.oauth1_token,
                oauth1_token_secret: oauth1.oauth1_token_secret,
            },
        });

        // 3️⃣ Publicar tweet con media_ids
        const url = `${X_API_V1}/statuses/update.json`;

        const body = new URLSearchParams();
        body.set("status", post.text);
        body.set("media_ids", media.media_id_string);

        const oauthHeaders = oauth.toHeader(
            oauth.authorize(
                { url, method: "POST" },
                {
                    key: oauth1.oauth1_token,
                    secret: oauth1.oauth1_token_secret,
                }
            )
        );

        const headers: Record<string, string> = {
            Authorization: oauthHeaders.Authorization,
            "Content-Type": "application/x-www-form-urlencoded",
        };

        try {
            const resp = await axios.post(url, body.toString(), { headers });

            const tweetId = resp.data.id_str;
            await XPostsModel.markPublished(post.id, tweetId);

            return tweetId;
        } catch (error: any) {
            throw new AppError({
                name: "XPublishMediaError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error al publicar tweet con media en X",
                details: {
                    status: error?.response?.status,
                    response: error?.response?.data,
                },
            });
        }
    }
}
