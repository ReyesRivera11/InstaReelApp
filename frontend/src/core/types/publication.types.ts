export interface Publication {
  id: number
  client_id: number
  title: string
  description?: string | null
  status: "scheduled" | "published" | "failed" | string
  // Database returns snake_case
  video_url?: string | null
  scheduled_date?: string | null
  // TypeScript/API may use camelCase
  videoUrl?: string | null
  scheduledDate?: string | null
  creationId?: string | null
  videoSize?: number | null
  container_media_id?: string | null
  containerMediaId?: string | null
}

export interface CreatePublicationDto {
  client_id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  scheduledDate?: string;
  status: "scheduled" | "published";
  creationId?: string;
  videoSize?: number;
}
