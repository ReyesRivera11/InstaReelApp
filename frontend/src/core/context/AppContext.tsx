import { createContext } from "react";
import type {
  User,
  ClientDB,
  Reels,
  Page,
  CreateClientDTO,
  UpdateClientDTO,
} from "../types";

export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  clients: ClientDB[];
  addClient: (data?: CreateClientDTO) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  loadClients: () => Promise<void>;

  updateClient: (id: number, data: UpdateClientDTO) => Promise<void>;

  publications: Reels[];
  addPublication: (publication: Omit<Reels, "id" | "status">) => void;
  deletePublication: (id: number) => void;
  oauthCompleted: boolean;
  setOauthCompleted: (value: boolean) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
