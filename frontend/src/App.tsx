import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./core/context/AppProvider";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { ClientsPage } from "./modules/clients/pages/ClientsPage";
import DashboardPage from "./modules/dashboard/pages/DashboardPage";
import { PublicationsPage } from "./modules/publications/pages/PublicationsPage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { Sidebar } from "./shared/components/Sidebar";
import { useApp } from "./shared/hooks/useApp";
import { MetaCallbackPage } from "./shared/hooks/metaCallBack";
import ScheduleReelPage from "./modules/schedule/ScheduleReelPage";

function AppContent() {
  const { isAuthenticated, currentPage, setCurrentPage, logout } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={logout}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {currentPage === "dashboard" && <DashboardPage />}
            {currentPage === "clients" && <ClientsPage />}
            {currentPage === "schedule" && <ScheduleReelPage />}
            {currentPage === "publications" && <PublicationsPage />}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
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
  );
}
