import OAuth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";
import prisma from "../../../shared/lib/prisma";

const REQUEST_TOKEN_URL = "https://api.twitter.com/oauth/request_token";
const ACCESS_TOKEN_URL = "https://api.twitter.com/oauth/access_token";
const AUTHORIZE_URL = "https://api.twitter.com/oauth/authorize";

/* ================================
   OAuth 1.0a Client (X)
================================ */
const oauth = new OAuth({
    consumer: {
        key: process.env.X_API_KEY!,
        secret: process.env.X_API_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
        return crypto
            .createHmac("sha1", key)
            .update(baseString)
            .digest("base64");
    },
});

export class XOAuth1Service {
    /* =====================================
       Step 1: Request Token
       ⚠️ oauth_callback DEBE ir en la FIRMA
    ===================================== */
    static async getRequestToken(): Promise<{
        oauth_token: string | null;
        oauth_token_secret: string | null;
    }> {
        const oauthHeaders = oauth.toHeader(
            oauth.authorize({
                url: REQUEST_TOKEN_URL,
                method: "POST",
                data: {
                    oauth_callback: process.env.X_OAUTH1_CALLBACK!,
                },
            })
        );

        const headers: Record<string, string> = {
            Authorization: oauthHeaders.Authorization,
        };

        const response = await axios.post(
            REQUEST_TOKEN_URL,
            null,
            { headers }
        );

        const params = new URLSearchParams(response.data);

        return {
            oauth_token: params.get("oauth_token"),
            oauth_token_secret: params.get("oauth_token_secret"),
        };
    }

    /* =====================================
       Step 2: Authorize URL
    ===================================== */
    static getAuthorizeUrl(oauthToken: string): string {
        return `${AUTHORIZE_URL}?oauth_token=${oauthToken}`;
    }

    /* =====================================
       Step 3: Access Token
       ⚠️ oauth_verifier TAMBIÉN va firmado
    ===================================== */
    static async getAccessToken(
        oauthToken: string,
        oauthTokenSecret: string,
        oauthVerifier: string
    ): Promise<{
        oauth1_token: string;
        oauth1_token_secret: string;
        x_user_id: string;
        username: string;
    }> {
        const oauthHeaders = oauth.toHeader(
            oauth.authorize(
                {
                    url: ACCESS_TOKEN_URL,
                    method: "POST",
                    data: {
                        oauth_verifier: oauthVerifier,
                    },
                },
                {
                    key: oauthToken,
                    secret: oauthTokenSecret,
                }
            )
        );

        const headers: Record<string, string> = {
            Authorization: oauthHeaders.Authorization,
        };

        const response = await axios.post(
            ACCESS_TOKEN_URL,
            null,
            {
                headers,
                params: { oauth_verifier: oauthVerifier },
            }
        );

        const params = new URLSearchParams(response.data);

        return {
            oauth1_token: params.get("oauth_token")!,
            oauth1_token_secret: params.get("oauth_token_secret")!,
            x_user_id: params.get("user_id")!,
            username: params.get("screen_name")!,
        };
    }

    static async clearByClientId(clientId: number) {
        await prisma.x_oauth1_sessions.deleteMany({
            where: {
                client_id: clientId,
            },
        });
    }
}
