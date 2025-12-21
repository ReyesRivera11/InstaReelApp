import { axiosInstance } from "../apiBase";

export const apiXPosts = {
  create: async (formData: FormData) => {
    const response = await axiosInstance.post("/x/posts", formData, {
      headers: {
        // ⚠️ IMPORTANTE: override del JSON por multipart
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },
};
