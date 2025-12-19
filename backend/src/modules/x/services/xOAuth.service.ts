import crypto from "crypto";
import axios from "axios";
import { XAccountModel } from "../models/xAccount.model";

const X_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const X_ME_URL = "https://api.twitter.com/2/users/me";

interface PKCEData {
    codeVerifier: string;
    codeChallenge: string;
}

export class XOAuthService {
    /* ============================
       PKCE helpers
    ============================ */

    private static generatePKCE(): PKCEData {
        const codeVerifier = crypto.randomBytes(32).toString("base64url");

        const hash = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest();

        const codeChallenge = Buffer.from(hash).toString("base64url");

        return { codeVerifier, codeChallenge };
    }

    /* ============================
       Step 1: Generate Auth URL
    ============================ */

    static generateAuthUrl(clientId: number) {
        const { codeVerifier, codeChallenge } = this.generatePKCE();

        const params = new URLSearchParams({
            response_type: "code",
            client_id: process.env.X_CLIENT_ID!,
            redirect_uri: process.env.X_REDIRECT_URI!,
            scope: process.env.X_SCOPES!,
            state: clientId.toString(),
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        return {
            url: `${X_AUTHORIZE_URL}?${params.toString()}`,
            codeVerifier, // ⚠️ debes persistirlo temporalmente
        };
    }

    /* ============================
       Step 2: Exchange code → token
    ============================ */

    static async exchangeCode(
        clientId: number,
        code: string,
        codeVerifier: string
    ) {
        const tokenResponse = await axios.post(
            X_TOKEN_URL,
            new URLSearchParams({
                grant_type: "authorization_code",
                client_id: process.env.X_CLIENT_ID!,
                redirect_uri: process.env.X_REDIRECT_URI!,
                code,
                code_verifier: codeVerifier,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
                        ).toString("base64"),
                },
            }
        );

        const {
            access_token,
            refresh_token,
            expires_in,
        } = tokenResponse.data;

        /* ============================
           Get X user info
        ============================ */

        const meResponse = await axios.get(X_ME_URL, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const { id: x_user_id, username } = meResponse.data.data;

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        return XAccountModel.create({
            client_id: clientId,
            x_user_id,
            username,
            access_token,
            refresh_token,
            expires_at: expiresAt,
        });
    }

    /* ============================
       Step 3: Refresh token
    ============================ */

    static async refreshToken(clientId: number, refreshToken: string) {
        const response = await axios.post(
            X_TOKEN_URL,
            new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: process.env.X_CLIENT_ID!,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization:
                        "Basic " +
                        Buffer.from(
                            `${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`
                        ).toString("base64"),
                },
            }
        );

        const {
            access_token,
            refresh_token: newRefreshToken,
            expires_in,
        } = response.data;

        const expiresAt = new Date(Date.now() + expires_in * 1000);

        return XAccountModel.updateTokens(clientId, {
            access_token,
            refresh_token: newRefreshToken,
            expires_at: expiresAt,
        });
    }
}
