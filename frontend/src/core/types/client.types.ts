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
export interface CreateClientDTO {
  name: string;
  username: string;
  description?: string;
}
export interface InitiateOAuthRequest {
  name: string;
  username: string;
  description?: string;
}
export interface ClientView {
  id: string;
  name: string;
  description?: string;
  idInsta: string;
  access_token: string;
  username: string;
}
export interface InitiateOAuthResponse {
  success: boolean;
  authUrl?: string;
  pendingClientId?: string;
  error?: string;
}
export interface ClientDB {
  id: number;
  name: string;
  username: string;
  description?: string;
  idInsta: string;
  access_token: string;
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
