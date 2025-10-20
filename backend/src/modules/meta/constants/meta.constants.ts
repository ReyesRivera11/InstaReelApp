export const META_API_URLS = {
  // Instagram Basic Display API
  INSTAGRAM_OAUTH: {
    SHORT_TOKEN: 'https://api.instagram.com/oauth/access_token',
    LONG_TOKEN: 'https://graph.instagram.com/access_token',
    REFRESH_TOKEN: 'https://graph.instagram.com/refresh_access_token'
  },

  // Instagram Graph API 
  INSTAGRAM_GRAPH: {
    BASE: 'https://graph.facebook.com',
    SHORT_TOKEN: 'https://graph.facebook.com/v24.0/oauth/access_token',
    ME_ACCOUNT: 'https://graph.facebook.com/v24.0/me/accounts',
    USER_MEDIA: (userId: string) => `https://graph.facebook.com/${userId}/media`,
    MEDIA_PUBLISH: (userId: string) => `https://graph.facebook.com/${userId}/media_publish`
  }
} as const;

export const META_GRANT_TYPES = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'ig_refresh_token',
  EXCHANGE_TOKEN: 'ig_exchange_token',
  FB_EXCHANGE_TOKEN: 'fb_exchange_token'
} as const;