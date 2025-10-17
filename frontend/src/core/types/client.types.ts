export interface Client {
  id: string;
  name: string;
  instagramHandle: string;
  description?: string;
  createdAt: string;
  accessToken?: string;
  pageId?: string;
  instagramId?: string;
  isAuthenticated?: boolean;
}
