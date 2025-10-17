import { useState } from "react";
import type { ReactNode } from "react";
import { AppContext } from "./AppContext";
import type { Client, Publication, Page } from "../types";

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
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
