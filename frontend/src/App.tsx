import { AppProvider } from "./core/context/AppProvider";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { ClientsPage } from "./modules/clients/pages/ClientsPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { PublicationsPage } from "./modules/publications/pages/PublicationsPage";
import { ScheduleReelPage } from "./modules/schedule/ScheduleReelPage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { Sidebar } from "./shared/components/Sidebar";
import { useApp } from "./shared/hooks/useApp";

function AppContent() {
  const {
    isAuthenticated,
    currentPage,
    setCurrentPage,
    clients,
    publications,
    logout,
  } = useApp();

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
            {currentPage === "dashboard" && (
              <DashboardPage publications={publications} clients={clients} />
            )}
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
      <AppContent />
    </AppProvider>
  );
}
