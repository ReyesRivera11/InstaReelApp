export interface Publication {
  id: string
  clientId: number
  title: string
  description: string
  videoUrl?: string
  scheduledDate: string
  status: "scheduled" | "published" | "failed"
  containerId?: string
  videoSize?: number
}

export interface CreatePublicationDto {
  clientId: number
  title: string
  description: string
  videoUrl: string
  scheduledDate: string
  status: "scheduled" | "published" | "failed"
  containerId?: string
  videoSize?: number
}
