// process.loadEnvFile();

export const {
  // Server
  PORT = 3000,

  // Bcrypt
  SALT_ROUNDS = 10,

  // JWT
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRES_IN = '15',
  JWT_REFRESH_TOKEN_EXPIRES_IN = '30',

  // Meta Graph API
  META_APP_ID,
  META_APP_SECRET,
  META_REDIRECT_URI,
} = process.env;
