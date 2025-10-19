export interface Publication {
  id: string;
  clientId: string;
  title: string;
  description: string;
  videoUrl?: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "failed";
  containerId?: string;
  videoSize?: number;
}

export interface CreatePublicationDto {
  clientId: string;
  title: string;
  description: string;
  videoUrl: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "failed";
  containerId?: string;
  videoSize?: number;
}
