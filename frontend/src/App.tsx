"use client"

import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "./core/context/AppProvider"
import { LoginPage } from "./modules/auth/pages/LoginPage"
import { ClientsPage } from "./modules/instagram/clients/pages/ClientsPage"
import DashboardPage from "./modules/dashboard/pages/DashboardPage"
import { ProtectedRoute } from "./shared/components/ProtectedRoute"
import { Sidebar } from "./shared/components/Sidebar"
import { useApp } from "./shared/hooks/useApp"
import { MetaCallbackPage } from "./shared/hooks/metaCallBack"
import ScheduleReelPage from "./modules/instagram/schedule/ScheduleReelPage"
import PublicationsPage from "./modules/instagram/publications/pages/PublicationsPage"
import React from "react"

function ComingSoonPage({ network }: { network: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Próximamente</h2>
        <p className="text-muted-foreground max-w-md">
          La gestión de {network} estará disponible pronto. Estamos trabajando para traerte las mejores herramientas.
        </p>
      </div>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, currentPage, setCurrentPage, logout } = useApp()

  const getActiveNetwork = (page: string): string => {
    if (page.startsWith("instagram")) return "instagram"
    if (page.startsWith("facebook")) return "facebook"
    if (page.startsWith("tiktok")) return "tiktok"
    if (page.startsWith("whatsapp")) return "whatsapp"
    if (page.startsWith("x-")) return "x"
    return "default"
  }

  const activeNetwork = getActiveNetwork(currentPage)

  React.useEffect(() => {
    document.documentElement.setAttribute("data-network", activeNetwork)
  }, [activeNetwork])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />

      case "clients":
      case "instagram-clients":
        return <ClientsPage />

      case "schedule":
      case "instagram-schedule":
        return <ScheduleReelPage />

      case "publications":
      case "instagram-publications":
        return <PublicationsPage />

      case "facebook-clients":
      case "facebook-publications":
      case "facebook-schedule":
        return <ComingSoonPage network="Facebook" />

      case "tiktok-clients":
      case "tiktok-publications":
      case "tiktok-schedule":
        return <ComingSoonPage network="TikTok" />

      case "whatsapp-clients":
      case "whatsapp-publications":
      case "whatsapp-schedule":
        return <ComingSoonPage network="WhatsApp" />

      case "x-clients":
      case "x-publications":
      case "x-schedule":
        return <ComingSoonPage network="X (Twitter)" />

      default:
        return <DashboardPage />
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={logout} />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{renderPage()}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/meta/callback" element={<MetaCallbackPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
