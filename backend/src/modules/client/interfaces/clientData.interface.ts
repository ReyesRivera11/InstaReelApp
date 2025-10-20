export interface ClientData {
  long_lived_token: string;
  name: string;
  username: string;
  access_token?: string;
  data_access_expiration_time?: string;
  expires_in?: string;
  description?: string;
  insta_id?: string;
}