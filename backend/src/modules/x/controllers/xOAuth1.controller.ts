import { Request, Response } from "express";
import { XOAuth1Service } from "../services/xOAuth1.service";
import prisma from "../../../shared/lib/prisma";

export class XOAuth1Controller {
    static async connect(req: Request, res: Response) {
        try {
            const client_id = Number(req.query.client_id);

            if (!client_id) {
                return res.status(400).json({
                    message: "client_id is required",
                });
            }

            const { oauth_token, oauth_token_secret } =
                await XOAuth1Service.getRequestToken();

            // 🔐 Validación fuerte (clave)
            if (!oauth_token || !oauth_token_secret) {
                return res.status(500).json({
                    message: "Failed to obtain OAuth 1.0a request token",
                });
            }

            await prisma.x_oauth1_sessions.create({
                data: {
                    oauth_token,
                    oauth_token_secret,
                    client_id,
                },
            });

            const url = XOAuth1Service.getAuthorizeUrl(oauth_token);
            return res.redirect(url);
        } catch (error) {
            console.error("OAuth1 connect error:", error);
            return res.status(500).json({
                message: "OAuth1 connect failed",
            });
        }
    }

    static async callback(req: Request, res: Response) {
        try {
            const oauth_token = req.query.oauth_token as string;
            const oauth_verifier = req.query.oauth_verifier as string;

            if (!oauth_token || !oauth_verifier) {
                return res.status(400).json({
                    message: "Invalid OAuth callback parameters",
                });
            }

            const session = await prisma.x_oauth1_sessions.findUnique({
                where: { oauth_token },
            });

            if (!session) {
                return res.status(400).json({
                    message: "OAuth session not found",
                });
            }

            const data = await XOAuth1Service.getAccessToken(
                oauth_token,
                session.oauth_token_secret,
                oauth_verifier
            );

            // 🔍 Buscamos primero la cuenta
            const account = await prisma.x_account.findFirst({
                where: {
                    client_id: session.client_id,
                    x_user_id: data.x_user_id,
                },
            });

            if (!account) {
                return res.status(404).json({
                    message: "X account not found for this client",
                });
            }

            // ✏️ Actualizamos con OAuth 1.0a
            await prisma.x_account.update({
                where: { id: account.id },
                data: {
                    oauth1_token: data.oauth1_token,
                    oauth1_token_secret: data.oauth1_token_secret,
                },
            });

            return res.redirect(
                `${process.env.FRONTEND_URL}/x/success`
            );
        } catch (error) {
            console.error("OAuth1 callback error:", error);
            return res.status(500).json({
                message: "OAuth1 callback failed",
            });
        }
    }
}
