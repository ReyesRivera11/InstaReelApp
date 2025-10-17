import { AppProvider } from "./core/context/AppProvider";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { ClientsPage } from "./modules/clients/pages/ClientsPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { PublicationsPage } from "./modules/publications/pages/PublicationsPage";
import { ScheduleReelPage } from "./modules/schedule/ScheduleReelPage";
import { Sidebar } from "./shared/components/Sidebar";
import { useApp } from "./shared/hooks/useApp";

function AppContent() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentPage,
    setCurrentPage,
    clients,
    addClient,
    deleteClient,
    publications,
  } = useApp();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentPage === "dashboard" && (
            <DashboardPage publications={publications} clients={clients} />
          )}
          {currentPage === "clients" && (
            <ClientsPage
              clients={clients}
              onAddClient={addClient}
              onDeleteClient={deleteClient}
            />
          )}
          {currentPage === "schedule" && <ScheduleReelPage />}
          {currentPage === "publications" && <PublicationsPage />}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
