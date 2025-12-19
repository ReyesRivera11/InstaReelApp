import axios from "axios";
import { XAccountModel } from "../models/xAccount.model";
import { XPostsModel } from "../models/xPosts.model";
import { XOAuthService } from "./xOAuth.service";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

const X_POST_TWEET_URL = "https://api.twitter.com/2/tweets";

export class XPostService {
    static async publishNow(clientId: number, text: string) {
        const account = await XAccountModel.getByClientId(clientId);

        if (!account) {
            throw new AppError({
                httpCode: HttpCode.NOT_FOUND,
                description: "X account not connected for this client",
            });
        }

        // Refresh token si expiró
        if (account.expires_at <= new Date() && account.refresh_token) {
            await XOAuthService.refreshToken(
                clientId,
                account.refresh_token
            );
        }

        const tweetResponse = await axios.post(
            X_POST_TWEET_URL,
            { text },
            {
                headers: {
                    Authorization: `Bearer ${account.access_token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const tweetId = tweetResponse.data.data.id;

        return XPostsModel.create({
            client_id: clientId,
            text,
        }).then(post =>
            XPostsModel.markAsPublished(post.id, tweetId)
        );
    }
}
