export interface Publication {
  id: number;
  client_id: number;
  title: string;
  description?: string | null;
  status: "SCHEDULED" | "PUBLISHED" | "failed" | string;
  video_url?: string | null;
  scheduled_date?: string | null;
  videoUrl?: string | null;
  scheduledDate?: string | null;
  creationId?: string | null;
  videoSize?: number | null;
  container_media_id?: string | null;
  containerMediaId?: string | null;
}

export interface CreatePublicationDto {
  client_id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  scheduledDate?: string;
  status: "SCHEDULED" | "PUBLISHED";
  creationId?: string;
  videoSize?: number;
}
