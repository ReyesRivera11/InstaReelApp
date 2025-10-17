export interface Publication {
  id: string;
  clientId: string;
  title: string;
  description: string;
  videoUrl: string;
  scheduledDate: string;
  status: "scheduled" | "published" | "failed";
}
