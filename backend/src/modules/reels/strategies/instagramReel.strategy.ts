import { IReelPublishingStrategy, ReelPublishingData, ReelPublishingResult } from '../interfaces/ReelStrategy.interface';
import axios from 'axios';
import { scheduleJob } from 'node-schedule';

export class InstagramReelStrategy implements IReelPublishingStrategy {
  private readonly UPLOAD_URL = 'https://rupload.facebook.com/ig-api-upload/v24.0';
  private readonly GRAPH_URL = 'https://graph.facebook.com/v24.0';

  async createContainer(data: ReelPublishingData): Promise<string> {
    try {
      const response = await axios.post(
        `${this.GRAPH_URL}/${data.instagramId}/media`,
        {
          media_type: 'REELS',
          upload_type: 'resumable',
          caption: data.description || data.title,
        },
        {
          params: {
            access_token: data.accessToken
          }
        }
      );

      if (!response.data.id) {
        throw new Error('No se pudo crear el contenedor de Instagram');
      }

      return response.data.id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Error creando contenedor Instagram: ${error.response?.data?.error?.message || error.message}`);
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
        throw new Error(`Error subiendo video a Instagram: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async schedulePublishing(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult> {
    // Subir el video primero
    await this.uploadVideo(containerId, data);
    
    // Programar publicación con node-schedule (Instagram no soporta scheduling nativo)
    scheduleJob(data.scheduledDate, async () => {
      await this.publishImmediately(containerId, data);
    });

    return {
      success: true,
      containerId: containerId,
      scheduledTime: data.scheduledDate
    };
  }

  async publishImmediately(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult> {
    try {
      const response = await axios.post(
        `${this.GRAPH_URL}/${data.instagramId}/media_publish`,
        {
          creation_id: containerId,
        },
        {
          params: {
            access_token: data.accessToken
          }
        }
      );

      return {
        success: true,
        mediaId: response.data.id,
        containerId: containerId
      };
    } catch (error) {
      return {
        success: false,
        containerId: containerId,
        error: error instanceof Error ? error.message : 'Unknown error publishing to Instagram'
      };
    }
  }
}