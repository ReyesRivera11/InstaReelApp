import axios from "axios";
import crypto from "crypto";
import OAuth from "oauth-1.0a";
import FormData from "form-data";

import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

/**
 * Endpoints X Upload API (OAuth 1.0a)
 */
const X_UPLOAD_API = "https://upload.twitter.com/1.1/media/upload.json";

/**
 * Para videos: chunks de 5MB es un tamaño seguro para APPEND.
 */
const VIDEO_CHUNK_SIZE = 5 * 1024 * 1024;

type XMediaUploadResult = {
    media_id_string: string;
};

type OAuth1Credentials = {
    oauth1_token: string;
    oauth1_token_secret: string;
};

type UploadFromUrlInput = {
    mediaUrl: string;
    mimeType: string; // "image/jpeg" | "video/mp4" | etc.
    creds: OAuth1Credentials;
    // opcional: para guiar categoría del media (mejor preview)
    mediaCategory?: "tweet_image" | "tweet_video" | "tweet_gif";
};

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

function mustEnv(name: string) {
    if (!process.env[name]) {
        throw new AppError({
            name: "MissingEnv",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: `Falta variable de entorno ${name}`,
        });
    }
}

function oauth1Headers(params: {
    url: string;
    method: "POST" | "GET";
    creds: OAuth1Credentials;
    // oauth-1.0a firma también query/body params si se los pasas; aquí usamos lo mínimo seguro
}) {
    const { url, method, creds } = params;

    const headerObj = oauth.toHeader(
        oauth.authorize(
            { url, method },
            { key: creds.oauth1_token, secret: creds.oauth1_token_secret }
        )
    );

    // Axios quiere Record<string,string>
    return { Authorization: headerObj.Authorization } as Record<string, string>;
}

async function downloadAsBuffer(url: string) {
    try {
        const resp = await axios.get<ArrayBuffer>(url, {
            responseType: "arraybuffer",
        });
        return Buffer.from(resp.data);
    } catch (error: any) {
        throw new AppError({
            name: "XMediaDownloadError",
            httpCode: HttpCode.BAD_REQUEST,
            description: "No se pudo descargar la media desde media_url",
            details: { url, status: error?.response?.status, data: error?.response?.data },
        });
    }
}

function isVideo(mimeType: string) {
    return mimeType.startsWith("video/");
}

function defaultCategory(mimeType: string): "tweet_image" | "tweet_video" | "tweet_gif" {
    if (mimeType === "image/gif") return "tweet_gif";
    if (mimeType.startsWith("video/")) return "tweet_video";
    return "tweet_image";
}

async function uploadImageBase64(input: UploadFromUrlInput): Promise<XMediaUploadResult> {
    const { mediaUrl, mimeType, creds, mediaCategory } = input;

    const buf = await downloadAsBuffer(mediaUrl);
    const media_data = buf.toString("base64");

    // X acepta application/x-www-form-urlencoded con media_data
    const body = new URLSearchParams();
    body.set("media_data", media_data);
    // media_category ayuda a que X trate bien el media en tweet
    body.set("media_category", mediaCategory ?? defaultCategory(mimeType));

    const headers = {
        ...oauth1Headers({ url: X_UPLOAD_API, method: "POST", creds }),
        "Content-Type": "application/x-www-form-urlencoded",
    };

    try {
        const resp = await axios.post(X_UPLOAD_API, body.toString(), { headers });
        return { media_id_string: resp.data.media_id_string };
    } catch (error: any) {
        throw new AppError({
            name: "XMediaUploadImageError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error subiendo imagen a X (media/upload)",
            details: { status: error?.response?.status, data: error?.response?.data },
        });
    }
}

async function uploadVideoChunked(input: UploadFromUrlInput): Promise<XMediaUploadResult> {
    const { mediaUrl, mimeType, creds, mediaCategory } = input;

    const buf = await downloadAsBuffer(mediaUrl);
    const totalBytes = buf.length;

    // 1) INIT
    const initParams = new URLSearchParams();
    initParams.set("command", "INIT");
    initParams.set("total_bytes", String(totalBytes));
    initParams.set("media_type", mimeType);
    initParams.set("media_category", mediaCategory ?? defaultCategory(mimeType));

    const initHeaders = {
        ...oauth1Headers({ url: X_UPLOAD_API, method: "POST", creds }),
        "Content-Type": "application/x-www-form-urlencoded",
    };

    let mediaId: string;
    try {
        const initResp = await axios.post(X_UPLOAD_API, initParams.toString(), { headers: initHeaders });
        mediaId = initResp.data.media_id_string;
    } catch (error: any) {
        throw new AppError({
            name: "XMediaInitError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error en INIT de media/upload (video)",
            details: { status: error?.response?.status, data: error?.response?.data },
        });
    }

    // 2) APPEND (multipart/form-data)
    // Firma con OAuth 1.0a solo sobre URL/method; el body multipart no lo metemos a la firma (práctica común)
    for (let offset = 0, segment = 0; offset < totalBytes; offset += VIDEO_CHUNK_SIZE, segment++) {
        const chunk = buf.slice(offset, Math.min(offset + VIDEO_CHUNK_SIZE, totalBytes));

        const form = new FormData();
        form.append("command", "APPEND");
        form.append("media_id", mediaId);
        form.append("segment_index", String(segment));
        form.append("media", chunk, { contentType: "application/octet-stream", filename: `segment-${segment}` });

        const appendHeaders = {
            ...oauth1Headers({ url: X_UPLOAD_API, method: "POST", creds }),
            ...form.getHeaders(),
        };

        try {
            await axios.post(X_UPLOAD_API, form, { headers: appendHeaders, maxBodyLength: Infinity, maxContentLength: Infinity });
        } catch (error: any) {
            throw new AppError({
                name: "XMediaAppendError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error en APPEND de media/upload (video)",
                details: { segment, status: error?.response?.status, data: error?.response?.data },
            });
        }
    }

    // 3) FINALIZE
    const finParams = new URLSearchParams();
    finParams.set("command", "FINALIZE");
    finParams.set("media_id", mediaId);

    try {
        const finResp = await axios.post(X_UPLOAD_API, finParams.toString(), {
            headers: { ...initHeaders }, // mismo content-type urlencoded
        });

        // 4) Si hay procesamiento asíncrono, hacemos polling STATUS
        const processing = finResp.data?.processing_info;
        if (processing?.state === "pending" || processing?.state === "in_progress") {
            await waitForProcessing(mediaId, creds);
        }

        return { media_id_string: mediaId };
    } catch (error: any) {
        throw new AppError({
            name: "XMediaFinalizeError",
            httpCode: HttpCode.INTERNAL_SERVER_ERROR,
            description: "Error en FINALIZE de media/upload (video)",
            details: { status: error?.response?.status, data: error?.response?.data },
        });
    }
}

async function waitForProcessing(mediaId: string, creds: OAuth1Credentials) {
    const maxAttempts = 20; // ~hasta 40-60s según intervalos
    let attempt = 0;

    while (attempt < maxAttempts) {
        attempt++;

        const url = `${X_UPLOAD_API}?command=STATUS&media_id=${encodeURIComponent(mediaId)}`;
        const headers = oauth1Headers({ url, method: "GET", creds });

        try {
            const resp = await axios.get(url, { headers });
            const info = resp.data?.processing_info;

            if (!info) return;

            if (info.state === "succeeded") return;

            if (info.state === "failed") {
                throw new AppError({
                    name: "XMediaProcessingFailed",
                    httpCode: HttpCode.BAD_REQUEST,
                    description: "X falló el procesamiento del video",
                    details: { error: info?.error },
                });
            }

            const waitSec = Math.max(2, Number(info.check_after_secs ?? 3));
            await new Promise((r) => setTimeout(r, waitSec * 1000));
        } catch (error: any) {
            if (error instanceof AppError) throw error;
            throw new AppError({
                name: "XMediaStatusError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error consultando STATUS de media/upload (video)",
                details: { message: error?.message, status: error?.response?.status, data: error?.response?.data },
            });
        }
    }
}

export class XMediaService {
    /**
     * Sube media (imagen o video) a X usando OAuth 1.0a y devuelve media_id_string.
     */
    static async uploadFromUrl(input: UploadFromUrlInput): Promise<XMediaUploadResult> {
        mustEnv("X_API_KEY");
        mustEnv("X_API_SECRET");

        const { mimeType } = input;

        // image/*
        if (!isVideo(mimeType)) {
            return uploadImageBase64(input);
        }

        // video/*
        return uploadVideoChunked(input);
    }
}
