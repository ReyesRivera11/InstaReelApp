export interface MediaContainerData {
  upload_type: "resumable";
  media_type: "REELS";
  access_token: string;
  caption?: string;
}
export interface MetaApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}
export interface MediaContainerResponse {
  id?: string;
  uri?: string;
}

export interface UploadHeaders extends Record<string, string> {
  Authorization: string;
  offset: string;
  file_size: string;
  "Content-Type": string;
}

export interface UploadResponse {
  video_id?: string;
  success?: boolean;
  error?: unknown;
}
