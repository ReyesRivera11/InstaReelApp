// strategies/facebook-reel.strategy.ts
import { IReelPublishingStrategy, ReelPublishingData, ReelPublishingResult } from '../interfaces/ReelStrategy.interface';
import axios from 'axios';

export class FacebookReelStrategy implements IReelPublishingStrategy {
  private readonly UPLOAD_URL = 'https://rupload.facebook.com/video-upload/v24.0';
  private readonly GRAPH_URL = 'https://graph.facebook.com/v24.0';

  async createContainer(data: ReelPublishingData): Promise<string> {
    try {
      const response = await axios.post(
        `${this.GRAPH_URL}/${data.instagramId}/video_reels`,
        {
          upload_phase: 'start',
          access_token: data.accessToken,
        }
      );

      if (!response.data.video_id) {
        throw new Error('No se pudo crear el contenedor de Facebook');
      }

      return response.data.video_id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error creando contenedor Facebook: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async uploadVideo(containerId: string, data: ReelPublishingData): Promise<void> {
    try {
      await axios.post(
        `${this.UPLOAD_URL}/${containerId}`,
        data.videoFile.buffer,
        {
          headers: {
            Authorization: `OAuth ${data.accessToken}`,
            offset: '0',
            file_size: data.videoFile.size.toString(),
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error subiendo video a Facebook: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async schedulePublishing(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult> {
    // Subir el video
    await this.uploadVideo(containerId, data);
    
    // Facebook soporta scheduling nativo
    const scheduledTimestamp = Math.floor(data.scheduledDate.getTime() / 1000);
    
     await axios.post(
      `${this.GRAPH_URL}/${data.instagramId}/video_reels`,
      {
        access_token: data.accessToken,
        video_id: containerId,
        upload_phase: 'finish',
        video_state: 'SCHEDULED',
        title: data.title,
        description: data.description,
        scheduled_publish_time: scheduledTimestamp,
      }
    );

    return {
      success: true,
      mediaId: containerId, // En Facebook, el containerId es el mediaId final
      containerId: containerId,
      scheduledTime: data.scheduledDate
    };
  }

  async publishImmediately(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult> {
    await this.uploadVideo(containerId, data);
    
     await axios.post(
      `${this.GRAPH_URL}/${data.instagramId}/video_reels`,
      {
        access_token: data.accessToken,
        video_id: containerId,
        upload_phase: 'finish',
        video_state: 'PUBLISHED',
        title: data.title,
        description: data.description,
      }
    );

    return {
      success: true,
      mediaId: containerId,
      containerId: containerId
    };
  }
}