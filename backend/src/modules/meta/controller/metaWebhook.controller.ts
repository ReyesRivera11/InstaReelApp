// controllers/webhook.controller.ts
import { Request, Response } from "express";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { ReelsModel } from "../../reels/models/reels.model";
import { FB_WEBHOOK_VERIFY_TOKEN } from "../../../shared/config/env";

export class MetaWebhookController {
  static async verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = String(FB_WEBHOOK_VERIFY_TOKEN);

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      res.status(200).send(challenge);
    } else {
      throw new AppError({
        httpCode: HttpCode.FORBIDDEN,
        description: "Verification failed",
      });
    }
  }

  static handleWebhook = async (req: Request, res: Response) => {
    try {
      const body = req.body;

      // Meta need a 200 response inmediately
      res.status(200).send("EVENT_RECEIVED");

      // Process on background
      if (body.object === "page") {
        for (const entry of body.entry) {
          await MetaWebhookController.processPageEntry(entry);
        }
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
    }
  };

  private static processPageEntry = async (entry: any) => {
    try {
      for (const event of entry.changes || []) {
        await MetaWebhookController.processPageChange(event);
      }
    } catch (error) {
      console.error("Error processing page entry:", error);
    }
  };

  private static processPageChange = async (event: any) => {
    if (event.field === "feed") {
      const value = event.value;

      // Only process video posts
      if (
        value.item === "video" &&
        value.verb === "add" &&
        value.published === 1
      ) {
        const reel = await ReelsModel.findReelByContainerId(value.video_id);

        if (reel && reel.status === "SCHEDULED") {
          // URL to Facebook reel
          const reelUrl = `https://www.facebook.com/reel/${value.video_id}`;

          // Update database with reel URL
          await ReelsModel.updateReelAfterPublishing(reel.id, reelUrl);
        }
      }
    }
  };
}
