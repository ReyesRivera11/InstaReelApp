"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AppContext } from "./AppContext";
import type { Client, Publication, Page, User } from "../types";
import { storage } from "../../shared/services/storage/localStorage";
import { apiClient } from "../../shared/services/api/apiClients";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: "1",
      clientId: "1",
      title: "Nuevo menú de temporada",
      description:
        "Descubre nuestros nuevos cafés especiales ☕ #CafeBonito #Coffee",
      videoUrl: "",
      scheduledDate: new Date(2025, 9, 20, 10, 0).toISOString(),
      status: "scheduled",
    },
    {
      id: "2",
      clientId: "2",
      title: "Rutina de entrenamiento",
      description: "Ejercicios para empezar tu semana 💪 #Fitness #Workout",
      videoUrl: "",
      scheduledDate: new Date(2025, 9, 18, 9, 0).toISOString(),
      status: "published",
    },
  ]);
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
      if (response) {
        const userData: User = {
          id: response.user?.id,
          email: response.user?.email,
          firstName: response.user?.firstName,
          lastName: response.user?.lastName,
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

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
    }
  };

  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  const addPublication = (publication: Omit<Publication, "id" | "status">) => {
    const newPublication: Publication = {
      ...publication,
      id: Date.now().toString(),
      status: "scheduled",
    };
    setPublications([...publications, newPublication]);
  };

  const deletePublication = (id: string) => {
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
        publications,
        addPublication,
        deletePublication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
