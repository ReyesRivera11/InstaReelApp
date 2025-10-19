const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
} as const;

export const storage = {
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken: (): string | null => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  clear: (): void => {
    localStorage.clear();
  },
};
