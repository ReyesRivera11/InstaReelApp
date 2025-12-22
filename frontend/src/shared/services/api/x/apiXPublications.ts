import { axiosInstance } from "../apiBase"

interface XPublicationsFilters {
    page?: number
    limit?: number
    search?: string
    status?: "SCHEDULED" | "PUBLISHED"
}

export const apiXPublications = {
    getPublications: async (filters: XPublicationsFilters) => {
        const { data } = await axiosInstance.get("/x", {
            params: filters,
        })
        return data
    },

    getPublicationById: async (id: number) => {
        const { data } = await axiosInstance.get(`/x/${id}`)
        return data
    },
}
