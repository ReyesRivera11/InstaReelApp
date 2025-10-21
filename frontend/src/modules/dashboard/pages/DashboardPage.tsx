"use client";

import { useEffect, useState } from "react";
import { apiDashboard } from "../../../shared/services/api/apiDashboard";
import type { DashboardData } from "../../../core/types/dashboard.types";
import { DashboardStats } from "../components/DashboardStats";
import { RecentPublications } from "../components/RecentPublications";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);

      const response = await apiDashboard.getDashboard();

      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Error al cargar el dashboard");
        setData({
          stats: {
            activeClients: 0,
            scheduledPublications: 0,
            completedPublications: 0,
            todayPublications: 0,
          },
          recentPublications: [],
        });
      }

      setLoading(false);
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de gestión de Instagram Reels
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <DashboardStats stats={data.stats} />

      <RecentPublications publications={data.recentPublications} />
    </div>
  );
}
