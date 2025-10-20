"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { Publication, Page, User, ClientDB, UpdateClientDTO } from "../types";
import { storage } from "../../shared/services/storage/localStorage";
import { apiClient } from "../../shared/services/api/apiClients";
import { AppContext } from "./AppContext";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [clients, setClients] = useState<ClientDB[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [oauthCompleted, setOauthCompleted] = useState(false);

  const fetchUserData = useCallback(async () => {
    const token = storage.getToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getMe();
      if (response && response.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error("Failed to get user data");
      }
    } catch (error) {
      console.error("[v0] Error fetching user data:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    try {
      const response = await apiClient.getClients();
      if (response.clients) {
        setClients(response.clients);
      }
    } catch (error) {
      console.error("[v0] Error loading clients:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (isAuthenticated) {
      loadClients();
    }
  }, [isAuthenticated, loadClients]);

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Error calling logout API:", error);
    } finally {
      storage.clear();
      setUser(null);
      setIsAuthenticated(false);
      setCurrentPage("dashboard");
      setClients([]);
      setPublications([]);
    }
  };

  const addClient = async () => {
    await loadClients();
  };

  const deleteClient = async (id: number) => {
    try {
      const response = await apiClient.deleteClient(id);
      if (response.success) {
        setClients(clients.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("[v0] Error deleting client:", error);
    }
  };

  const updateClient = async (id: number, data: UpdateClientDTO) => {
    try {
      const response = await apiClient.editClient(id, data);
      if (response.success && response.data) {
        setClients((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...response.data } : c))
        );
      } else {
        console.error("[v0] Error updating client:", response.error);
        throw new Error(response.error || "Error al actualizar cliente");
      }
    } catch (error) {
      console.error("[v0] Error in updateClient:", error);
      throw error;
    }
  };

  const addPublication = (
    publicationData: Omit<Publication, "id" | "status">
  ) => {
    const newPublication: Publication = {
      ...publicationData,
      id: Date.now(), 
      status: "scheduled",
    };
    setPublications([...publications, newPublication]);
  };

  const deletePublication = (id: number) => {
    setPublications(publications.filter((p) => p.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider 
      value={{
        user,
        isAuthenticated,
        setIsAuthenticated,
        setUser,
        logout,
        currentPage,
        setCurrentPage,
        clients,
        addClient,
        deleteClient,
        loadClients,
        publications,
        addPublication,
        deletePublication,
        oauthCompleted,
        setOauthCompleted,
        updateClient
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
