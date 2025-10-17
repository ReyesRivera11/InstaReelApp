import { useContext } from "react";
import { AppContext } from "../../core/context/AppContext";
import type { AppContextType } from "../../core/context/AppContext";

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
