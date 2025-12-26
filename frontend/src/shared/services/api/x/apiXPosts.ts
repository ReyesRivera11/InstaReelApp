import { axiosInstance } from "../apiBase";

export const apiXPosts = {
    create: async (formData: FormData) => {
        const response = await axiosInstance.post("/x/posts", formData, {
            headers: {
                // ⚠️ IMPORTANTE: multipart
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    },

    /**
     * Inicia el flow OAuth 1.0a con redirect (backend responde con res.redirect hacia X).
     * Esto debe ejecutarse en el browser.
     */
    oauth1ConnectRedirect: (clientId: number) => {
        const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") ?? ""
        const url = `${baseURL}/x/oauth1/connect?client_id=${clientId}`

        const width = 600
        const height = 700
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        window.open(
            url,
            "x-oauth1-popup",
            `width=${width},height=${height},left=${left},top=${top}`
        )
    }

};
