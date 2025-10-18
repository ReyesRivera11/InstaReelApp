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

export interface User {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface GetMeResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}
