"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { ClientCard } from "../components/ClientCard";
import { AddClientModal } from "../components/AddClientModal";
import { EditClientModal } from "../components/EditClientModal";  
import { useApp } from "../../../../shared/hooks/useApp";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import type {
  ClientDB,
  PaginatedClients,
  UpdateClientDTO,
} from "../../../../core/types";
import { apiClient } from "../../../../shared/services/api/reels/apiClients";
import { Alert, Button } from "../../../../shared/components/ui";

// Logo 
const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function XClientsPage() {
  const {
    addClient,
    deleteClient,
    updateClient,
    oauthCompleted,
    setOauthCompleted,
  } = useApp();

  const [clients, setClients] = useState<ClientDB[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientDB | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: PaginatedClients = await apiClient.getClients({
        page: currentPage,
        limit: itemsPerPage,
        social_identity: "X",
        search: debouncedSearchTerm || undefined,
      });

      if (response.clients && Array.isArray(response.clients)) {
        setClients(response.clients);
        setTotalPages(response.totalPages);
        setTotalClients(response.total);
        setHasNext(response.hasNext);
        setHasPrev(response.hasPrev);
      } else {
        setClients([]);
        setError("Error al cargar las cuentas");
      }
    } catch (err) {
      setClients([]);
      setError(err instanceof Error ? err.message : "Error al cargar las cuentas");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  const handleDeleteClient = async (id: number) => {
    try {
      await deleteClient(id);
      setSuccess(true);
      await loadClients();
    } catch {
      setError("Error al eliminar la cuenta");
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadClients();
      setSuccess(true);
    } catch {
      setError("Error al recargar las cuentas");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadClients();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (oauthCompleted) {
      setIsModalOpen(false);
      setSuccess(true);
      loadClients().catch(() => setError("Error al recargar cuentas"));
      setOauthCompleted(false);
    }
  }, [oauthCompleted, loadClients, setOauthCompleted]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddClient = async (data: {
    name: string;
    username: string;
    description?: string;
  }) => {
    try {
      await addClient(data);
      setSuccess(true);
      setIsModalOpen(false);
      await loadClients();
    } catch {
      setError("Error al conectar la cuenta");
    }
  };

  const handleUpdateClient = async (id: number, data: UpdateClientDTO) => {
    try {
      await updateClient(id, data);
      setSuccess(true);
      await loadClients();
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch {
      setError("Error al actualizar la cuenta");
    }
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    await loadClients();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Mostrando {clients.length} de {totalClients} cuentas
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="11 17 6 12 11 7" strokeWidth="2" />
              <polyline points="18 17 13 12 18 7" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!hasPrev}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" strokeWidth="2" />
            </svg>
          </button>

          {startPage > 1 && (
            <>
              <button onClick={() => setCurrentPage(1)} className="px-3 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                1
              </button>
              {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? "bg-black text-white border-black"
                  : "border-border hover:bg-accent"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
              <button onClick={() => setCurrentPage(totalPages)} className="px-3 py-2 border border-border rounded-lg hover:bg-accent text-sm">
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!hasNext}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={!hasNext}
            className="px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="13 17 18 12 13 7" strokeWidth="2" />
              <polyline points="6 17 11 12 6 7" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Operación realizada con éxito!
        </Alert>
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <XLogo className="w-12 h-12" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Mis Cuentas de X
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona las cuentas de X conectadas
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Recargando..." : "Recargar"}
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Plus className="w-4 h-4" />
              Conectar Cuenta
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
            <input
              placeholder="Buscar por nombre o @username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <AddClientModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}

        />

        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateClient}
          client={selectedClient}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando cuentas...</p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border">
            {clients.length > 0 && (
              <div className="px-6 pt-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">
                  {totalClients} {totalClients === 1 ? "Cuenta" : "Cuentas"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Listado completo de tus cuentas conectadas en X
                </p>
              </div>
            )}
            <div className="p-6">
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <XLogo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No se encontraron cuentas con la búsqueda"
                      : "No tienes cuentas conectadas aún"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 bg-black hover:bg-gray-800 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Conectar tu primera cuenta
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {clients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onDelete={handleDeleteClient}
                      onEdit={(client) => {
                        setSelectedClient(client);
                        setIsEditModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {renderPaginationControls()}
          </div>
        )}
      </div>
    </>
  );
}