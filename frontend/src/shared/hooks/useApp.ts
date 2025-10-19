"use client";

import { useContext } from "react";
import { AppContext, type AppContextType } from "../../core/context/AppContext";

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
