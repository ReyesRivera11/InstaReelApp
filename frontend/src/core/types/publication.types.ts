export interface Publication {
  id: number;
  client_id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  scheduledDate?: string;
  status: "scheduled" | "published";
  creationId?: string;
  videoSize?: number; // campo extra opcional solo para frontend
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
