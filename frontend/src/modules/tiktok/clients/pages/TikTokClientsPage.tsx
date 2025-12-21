"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, CheckCircle, X, RefreshCw, Plus } from "lucide-react";

import { ClientCard } from "../components/ClientCard";
import { EmptyState } from "../components/EmptyState";
import { AddTikTokClientModal } from "../components/AddTikTokClientModal";
import { EditClientModal } from "../components/EditClientModal";

import type { ClientDB, UpdateClientDTO } from "../../../../core/types";
import { Alert, Button } from "../../../../shared/components/ui";
import { apiTikTokClients } from "../../../../shared/services/api/tiktok/apiTikTokClients";

export function TikTokClientsPage() {
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

  const itemsPerPage = 10;

  /* ---------- Alerts auto-hide ---------- */
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  /* ---------- Search debounce ---------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ---------- Load clients ---------- */
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiTikTokClients.getClients({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
      });

      setClients(response.clients);
      setTotalPages(response.totalPages);
      setTotalClients(response.total);
    } catch (e) {
      setClients([]);
      setError(
        e instanceof Error
          ? e.message
          : "Error al cargar los clientes de TikTok"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  /* ---------- Reset page on search ---------- */
  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
    else loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  /* ---------- OAuth callback ---------- */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tiktokStatus = params.get("tiktok");

    if (tiktokStatus === "success1") {
      setIsModalOpen(false);
      setSuccess(true);
      loadClients().catch(() =>
        setError("Error al recargar clientes.")
      );
    }

    if (tiktokStatus === "error") {
      setIsModalOpen(false);
      setError("Error al conectar TikTok. Intenta nuevamente.");
    }

    if (tiktokStatus) {
      params.delete("tiktok");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, "", newUrl);
    }
  }, [loadClients]);

  /* ---------- Actions ---------- */
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadClients();
      setSuccess(true);
    } catch {
      setError("Error al recargar los clientes");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      const res = await apiTikTokClients.deleteClient(id);

      if (!res.success) {
        throw new Error(res.error || "No se pudo eliminar");
      }

      setSuccess(true);
      await loadClients();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al eliminar el cliente"
      );
    }
  };

  const handleUpdateClient = async (id: number, data: UpdateClientDTO) => {
    try {
      const res = await apiTikTokClients.updateClient(id, data);

      if (!res.success) {
        throw new Error(res.error || "No se pudo actualizar");
      }

      setSuccess(true);
      await loadClients();
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al actualizar el cliente"
      );
    }
  };

  const handleClearSearch = () => setSearchTerm("");

  /* ---------- Pagination ---------- */
  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    const end = Math.min(totalPages, start + max - 1);

    if (end - start < max - 1) {
      start = Math.max(1, end - max + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex justify-between items-center px-6 py-4 border-t">
        <span className="text-sm text-muted-foreground">
          Mostrando {clients.length} de {totalClients}
        </span>

        <div className="flex gap-2">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-2 rounded-lg text-sm ${
                p === currentPage
                  ? "bg-black text-white"
                  : "border hover:bg-accent"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ---------- Render ---------- */
  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle />}>
          Operación realizada con éxito
        </Alert>
      )}

      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes TikTok</h1>
            <p className="text-muted-foreground">
              Gestiona las cuentas TikTok de tus clientes
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
              Recargar
            </Button>

            <Button
              className="bg-black text-white"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus /> Agregar Cliente
            </Button>
          </div>
        </div>

        <div className="relative">
          <input
            placeholder="Buscar por nombre o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X />
            </button>
          )}
        </div>

        <AddTikTokClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateClient}
          client={selectedClient}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clients.length === 0 ? (
              <EmptyState onAddClient={() => setIsModalOpen(true)} />
            ) : (
              clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onDelete={handleDeleteClient}
                  onEdit={(c) => {
                    setSelectedClient(c);
                    setIsEditModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        )}

        {renderPaginationControls()}
      </div>
    </>
  );
}
