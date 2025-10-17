import { createContext } from "react";
import type { Client, Publication, Page } from "../types";

export interface AppContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "createdAt">) => void;
  deleteClient: (id: string) => void;
  publications: Publication[];
  addPublication: (publication: Omit<Publication, "id" | "status">) => void;
  deletePublication: (id: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
