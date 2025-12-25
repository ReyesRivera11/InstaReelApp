import crypto from "crypto";
import prisma from "../../../shared/lib/prisma";
import { SocialIdentity } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { XTokenResponse } from "../interfaces/XTokenResponse.interface";

export class XOAuthService {
    static async generateAuthUrl(data: {
        name: string;
        username: string;
        description?: string;
    }): Promise<{
        clientId: number;
        url: string;
        codeVerifier: string;
    }> {
        const existing = await prisma.client.findFirst({
            where: {
                username: data.username,
                social_identity: SocialIdentity.X,
            },
        });

        const client =
            existing ??
            (await prisma.client.create({
                data: {
                    name: data.name,
                    username: data.username,
                    description: data.description,
                    social_identity: SocialIdentity.X,
                },
            }));

        // PKCE
        const codeVerifier = crypto.randomBytes(32).toString("hex");
        const codeChallenge = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url");

        const params = new URLSearchParams({
            response_type: "code",
            client_id: process.env.X_CLIENT_ID as string,
            redirect_uri: process.env.X_REDIRECT_URI as string,
            scope: "tweet.read tweet.write users.read offline.access",
            state: String(client.id),
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

        return {
            clientId: client.id,
            url,
            codeVerifier,
        };
    }

    static async exchangeCode(clientId: number, code: string, codeVerifier: string) {
        const clientIdEnv = process.env.X_CLIENT_ID;
        const clientSecretEnv = process.env.X_CLIENT_SECRET; // 👈 si es Web App, casi siempre se requiere

        if (!clientIdEnv) {
            throw new AppError({
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Missing X_CLIENT_ID env var",
            });
        }

        if (!process.env.X_REDIRECT_URI) {
            throw new AppError({
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Missing X_REDIRECT_URI env var",
            });
        }

        // 1) Token exchange
        const tokenBody = new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.X_REDIRECT_URI,
            client_id: clientIdEnv,
            code_verifier: codeVerifier,
        });

        // ✅ Si tienes client secret, manda Basic Auth (muchas apps lo requieren aunque uses PKCE)
        const headers: Record<string, string> = {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        };

        if (clientSecretEnv) {
            const basic = Buffer.from(`${clientIdEnv}:${clientSecretEnv}`).toString("base64");
            headers.Authorization = `Basic ${basic}`;
        }

        const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
            method: "POST",
            headers,
            body: tokenBody.toString(),
        });

        const tokenRaw = await tokenResponse.text();

        if (!tokenResponse.ok) {
            // 👇 esto te dice EXACTO el motivo: invalid_grant, redirect_uri mismatch, etc.
            console.error("X TOKEN ERROR:", tokenRaw);

            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "Failed to exchange code with X",
                details: { x_error: tokenRaw }, // 👈 para que también lo veas en la respuesta si tu middleware lo expone
            });
        }

        // tokenRaw es JSON
        const tokenData = JSON.parse(tokenRaw) as XTokenResponse;

        if (!tokenData.access_token || !tokenData.expires_in) {
            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "X token response missing required fields",
                details: { tokenData },
            });
        }

        // 2) Obtener usuario de X
        const meResponse = await fetch("https://api.twitter.com/2/users/me", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/json",
            },
        });

        const meRaw = await meResponse.text();

        if (!meResponse.ok) {
            console.error("X /users/me ERROR:", meRaw);
            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "Failed to fetch X user profile",
                details: { x_error: meRaw },
            });
        }

        const meData = JSON.parse(meRaw) as {
            data: { id: string; username: string };
        };

        if (!meData?.data?.id || !meData?.data?.username) {
            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "Invalid X user profile response",
                details: { meData },
            });
        }

        // 3) Guardar en x_account
        // ✅ upsert para evitar error si ya existía (client_id es unique)
        const existingAccount = await prisma.x_account.findFirst({
            where: { client_id: clientId },
        });

        if (existingAccount) {
            await prisma.x_account.update({
                where: { id: existingAccount.id },
                data: {
                    x_user_id: meData.data.id,
                    username: meData.data.username,
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token ?? null,
                    expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
                },
            });
        } else {
            await prisma.x_account.create({
                data: {
                    client_id: clientId,
                    x_user_id: meData.data.id,
                    username: meData.data.username,
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token ?? null,
                    expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
                },
            });
        }
    }

    static async refreshToken(clientId: number): Promise<string> {
        const account = await prisma.x_account.findFirst({
            where: { client_id: clientId },
        });

        if (!account || !account.refresh_token) {
            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "No refresh token available for X account",
            });
        }

        const clientIdEnv = process.env.X_CLIENT_ID;
        const clientSecretEnv = process.env.X_CLIENT_SECRET;

        if (!clientIdEnv) {
            throw new AppError({
                httpCode: HttpCode.INTERNAL_SERVER_ERROR,
                description: "Missing X_CLIENT_ID env var",
            });
        }

        const body = new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: account.refresh_token,
            client_id: clientIdEnv,
        });

        const headers: Record<string, string> = {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        };

        // X suele requerir Basic Auth en refresh
        if (clientSecretEnv) {
            const basic = Buffer.from(
                `${clientIdEnv}:${clientSecretEnv}`
            ).toString("base64");
            headers.Authorization = `Basic ${basic}`;
        }

        const response = await fetch(
            "https://api.twitter.com/2/oauth2/token",
            {
                method: "POST",
                headers,
                body: body.toString(),
            }
        );

        const raw = await response.text();

        if (!response.ok) {
            console.error("X REFRESH TOKEN ERROR:", raw);
            throw new AppError({
                httpCode: HttpCode.UNAUTHORIZED,
                description: "Failed to refresh X access token",
                details: { x_error: raw },
            });
        }

        const data = JSON.parse(raw) as {
            access_token: string;
            refresh_token?: string;
            expires_in: number;
        };

        await prisma.x_account.updateMany({
            where: { client_id: clientId },
            data: {
                access_token: data.access_token,
                refresh_token: data.refresh_token ?? account.refresh_token,
                expires_at: new Date(Date.now() + data.expires_in * 1000),
            },
        });

        return data.access_token;
    }

}
