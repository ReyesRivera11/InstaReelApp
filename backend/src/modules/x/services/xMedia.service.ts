import { TwitterApi } from "twitter-api-v2";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

type OAuth1Credentials = {
    oauth1_token: string;
    oauth1_token_secret: string;
};

type UploadFromUrlInput = {
    mediaUrl: string;
    mimeType: string;
    creds: OAuth1Credentials;
};

type XMediaUploadResult = {
    media_id_string: string;
};

async function downloadAsBuffer(url: string): Promise<Buffer> {
    const { default: axios } = await import("axios");
    const resp = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
    });
    return Buffer.from(resp.data);
}

export class XMediaService {
    static async uploadFromUrl(
        input: UploadFromUrlInput
    ): Promise<XMediaUploadResult> {
        const { mediaUrl, mimeType, creds } = input;

        if (!mediaUrl) {
            throw new Error("mediaUrl es requerido");
        }

        // Descargar el archivo localmente en buffer
        const buffer = await downloadAsBuffer(mediaUrl);

        // Crear cliente temporal con OAuth 1.0a (solo para esta subida)
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY!,
            appSecret: process.env.X_API_SECRET!,
            accessToken: creds.oauth1_token,
            accessSecret: creds.oauth1_token_secret,
        });

        try {
            // La librería maneja TODO: detección de tipo, chunked si es video, polling de processing, etc.
            const mediaId = await client.v1.uploadMedia(buffer, {
                mimeType,
                // Opcional: para videos largos o con categoría específica
                // type: mimeType.startsWith("video/") ? "longmp4" : undefined,
                // additionalOwners: [...] si necesitas compartir
            });

            console.log("[X MEDIA] Upload success con twitter-api-v2", { mediaId });

            return { media_id_string: mediaId };
        } catch (error: any) {
            console.error("[X MEDIA] Upload FAILED con twitter-api-v2", {
                message: error?.message,
                data: error?.data || error?.response?.data,
                status: error?.code || error?.response?.status,
            });

            throw new AppError({
                name: "XMediaUploadError",
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Error subiendo media a X con nueva librería",
                details: error?.data || error?.message,
            });
        }
    }
}