export interface ReelPublishingResult {
  success: boolean;
  mediaId?: string;
  containerId?: string;
  scheduledTime?: Date;
  reelUrl?: string;
  error?: string;
}

export interface ReelPublishingData {
  clientId: number;
  title: string;
  description?: string;
  scheduledDate: Date;
  accessToken: string; 
  socialIdentity: string;
  videoFile: Express.Multer.File;
  targetId: string; 
}

export interface IReelPublishingStrategy {
  createContainer(data: ReelPublishingData): Promise<string>;
  uploadVideo(containerId: string, data: ReelPublishingData): Promise<void>;
  schedulePublishing(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult>;
  publishImmediately(containerId: string, data: ReelPublishingData): Promise<ReelPublishingResult>;
}