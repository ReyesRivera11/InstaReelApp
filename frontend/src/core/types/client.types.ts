export interface CreateClientDTO {
  name: string;
  username: string;
  description?: string;
  access_token?: string;
  expires_in?: string;
  long_lived_token?: string;
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
export interface UpdateClientDTO {
  name?: string;
  username?: string;
  description?: string;
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
  id_insta?: string;
  access_token?: string;
  long_lived_token?: string;
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
