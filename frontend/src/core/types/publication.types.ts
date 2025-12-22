export interface Reels {
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
  clientName?: string;
  media_url?: string;
}

export interface CreateReelsDto {
  client_id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  scheduledDate?: string;
  status: "SCHEDULED" | "PUBLISHED";
  creationId?: string;
  videoSize?: number;
}

export interface ReelsFilters {
  search?: string;
  status?: "SCHEDULED" | "PUBLISHED";
  page?: number;
  limit?: number;
  social_identity?: "X" | "INSTAGRAM" | "FACEBOOK";
}

export interface PaginatedReels {
  reels: Reels[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedXPublications {
  publications: Reels[];
  total: number;
  page?: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PaginatedAnyPublications =
  | PaginatedReels
  | PaginatedXPublications;

export interface XPublication {
  id: number;
  client_id: number;
  clientName?: string;

  text: string;

  status: "SCHEDULED" | "PUBLISHED" | "FAILED";

  scheduled_at?: string | null;
  published_at?: string | null;

  media_url?: string | null;
  tweet_id?: string | null;

  created_at: string;
  error_message?: string | null;
}
