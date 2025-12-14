import {
  IReelPublishingStrategy,
  ReelPublishingData,
  ReelPublishingResult,
} from "../interfaces/ReelStrategy.interface";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import { ReelsModel } from "../models/reels.model";
import { GetReelUrlService } from "../services/getInstagramReelUrl.service";

export class InstagramReelStrategy implements IReelPublishingStrategy {
  private readonly UPLOAD_URL =
    "https://rupload.facebook.com/ig-api-upload/v24.0";
  private readonly GRAPH_URL = "https://graph.facebook.com/v24.0";

  async createContainer(data: ReelPublishingData): Promise<string> {
    try {
      const response = await axios.post(
        `${this.GRAPH_URL}/${data.targetId}/media`,
        {
          media_type: "REELS",
          upload_type: "resumable",
          caption: data.description || data.title,
        },
        {
          params: {
            access_token: data.accessToken, // Client -> long lived token
          },
        }
      );

      if (!response.data.id) {
        throw new Error("No se pudo crear el contenedor de Instagram");
      }

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error creando contenedor Instagram: ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }
      throw error;
    }
  }

  async uploadVideo(
    containerId: string,
    data: ReelPublishingData
  ): Promise<void> {
    try {
      await axios.post(
        `${this.UPLOAD_URL}/${containerId}`,
        data.videoFile.buffer,
        {
          headers: {
            Authorization: `OAuth ${data.accessToken}`, // Client -> long lived token
            offset: "0",
            file_size: data.videoFile.size.toString(),
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error subiendo video a Instagram: ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }
      throw error;
    }
  }

  async schedulePublishing(
    containerId: string,
    data: ReelPublishingData,
    reelId?: number
  ): Promise<ReelPublishingResult> {
    // Upload video first
    await this.uploadVideo(containerId, data);

    // Schedule publication with node-schedule
    scheduleJob(data.scheduledDate, async () => {
      try {
        await this.publishImmediately(containerId, data, reelId);
      } catch (error) {
        console.error("Error en publicación programada:", error);
      }
    });

    return {
      success: true,
      containerId: containerId,
      scheduledTime: data.scheduledDate,
    };
  }

  async publishImmediately(
    containerId: string,
    data: ReelPublishingData,
    reelId?: number
  ): Promise<ReelPublishingResult> {
    try {
      // 1. Post reel
      const publishResponse = await axios.post(
        `${this.GRAPH_URL}/${data.targetId}/media_publish`,
        {
          creation_id: containerId,
        },
        {
          params: {
            access_token: data.accessToken,
          },
        }
      );

      const mediaId = publishResponse.data.id;

      // 2. Get reel URL
      let reelUrl: string;
      try {
        reelUrl = await GetReelUrlService.getReelUrl(mediaId, data.accessToken);
      } catch (urlError) {
        console.warn(
          "No se pudo obtener la URL del reel, pero la publicación fue exitosa:",
          urlError
        );
        reelUrl = `https://www.instagram.com/p/${mediaId}/`; // Default URL
      }

      // 3. Update database after publishing
      if (reelId) {
        await ReelsModel.updateReelAfterPublishing(reelId, reelUrl);
      }

      return {
        success: true,
        mediaId: mediaId,
        containerId: containerId,
        reelUrl: reelUrl,
      };
    } catch (error) {
      return {
        success: false,
        containerId: containerId,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error publishing to Instagram",
      };
    }
  }
}
