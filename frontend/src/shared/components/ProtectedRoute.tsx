"use client";

import type React from "react";

import { useEffect } from "react";
import { useApp } from "../hooks/useApp";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, setCurrentPage } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("[v0] User not authenticated, redirecting to login");
      setCurrentPage("dashboard");
    }
  }, [isAuthenticated, setCurrentPage]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
