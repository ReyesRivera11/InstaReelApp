export * from "./client.types";
export * from "./publication.types";

export type Page =
  | "dashboard"
  | "clients"
  | "schedule"
  | "publications"
  // Instagram
  | "instagram-clients"
  | "instagram-publications"
  | "instagram-schedule"
  // Facebook
  | "facebook-clients"
  | "facebook-publications"
  | "facebook-schedule"
  // TikTok
  | "tiktok-clients"
  | "tiktok-publications"
  | "tiktok-schedule"
  // WhatsApp
  | "whatsapp-clients"
  | "whatsapp-publications"
  | "whatsapp-schedule"
  // X (Twitter)
  | "x-clients"
  | "x-publications"
  | "x-schedule";
