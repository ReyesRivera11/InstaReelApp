"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../shared/components/ui/Button";
import { Alert } from "../../../shared/components/ui/Alert";
import { Icons } from "../../../shared/components/icons";
import { ClientCard } from "../components/ClientCard";
import { EmptyState } from "../components/EmptyState";
import { AddClientModal } from "../components/AddClientModal";
import { useApp } from "../../../shared/hooks/useApp";
import { AlertCircle, CheckCircle } from "lucide-react";

export function ClientsPage() {
  const { clients, addClient, deleteClient } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        // Clients are already loaded from AppProvider
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los clientes"
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadClients();
  }, []);

  const handleAddClient = async (data: {
    name: string;
    instagramHandle: string;
    description?: string;
  }) => {
    try {
      await addClient(data);
      setSuccess(true);
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al agregar el cliente"
      );
      throw err;
    }
  };

  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          icon={<CheckCircle className="w-5 h-5" />}
        >
          ¡Cliente agregado exitosamente!
        </Alert>
      )}

      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mis Clientes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las cuentas de Instagram de tus clientes
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Icons.Plus />
            Agregar Cliente
          </Button>
        </div>

        <AddClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddClient}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando clientes...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {clients.length === 0 ? (
              <EmptyState onAddClient={() => setIsModalOpen(true)} />
            ) : (
              clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onDelete={deleteClient}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
