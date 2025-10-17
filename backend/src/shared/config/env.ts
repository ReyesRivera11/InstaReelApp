process.loadEnvFile();

export const {
  PORT = 3000,
  SALT_ROUNDS = 10,
  JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN,
  JWT_ACCESS_TOKEN_EXPIRES_IN = '15min',
  JWT_REFRESH_TOKEN_EXPIRES_IN = '30d',
} = process.env;
