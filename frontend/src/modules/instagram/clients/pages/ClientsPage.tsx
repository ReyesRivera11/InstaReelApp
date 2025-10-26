"use client"
import { useState, useEffect } from "react"
import { Button } from "../../../../shared/components/ui/Button"
import { Alert } from "../../../../shared/components/ui/Alert"
import { Icons } from "../../../../shared/components/icons"
import { ClientCard } from "../components/ClientCard"
import { EmptyState } from "../components/EmptyState"
import { AddClientModal } from "../components/AddClientModal"
import { EditClientModal } from "../components/EditClientModal"
import { useApp } from "../../../../shared/hooks/useApp"
import { AlertCircle, CheckCircle } from "lucide-react"
import type { ClientDB, UpdateClientDTO } from "../../../../core/types"

export function ClientsPage() {
  const { clients, addClient, deleteClient, loadClients, updateClient, oauthCompleted, setOauthCompleted } = useApp()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientDB | null>(null)

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    const loadClientsData = async () => {
      try {
        setIsLoading(true)
        await loadClients()
      } catch {
        setError("Error al cargar los clientes")
      } finally {
        setIsLoading(false)
      }
    }
    loadClientsData()
  }, [loadClients])

  useEffect(() => {
    if (oauthCompleted) {
      setIsModalOpen(false)
      setSuccess(true)
      loadClients().catch(() => setError("Error al recargar clientes."))
      setOauthCompleted(false)
    }
  }, [oauthCompleted, loadClients, setOauthCompleted])

  const handleAddClient = async (data: {
    name: string
    username: string
    description?: string
  }) => {
    try {
      await addClient(data)
      setSuccess(true)
      setIsModalOpen(false)
      await loadClients()
    } catch {
      setError("Error al agregar el cliente")
    }
  }

  const handleUpdateClient = async (id: number, data: UpdateClientDTO) => {
    try {
      await updateClient(id, data)
      setSuccess(true)
      await loadClients()
      setIsEditModalOpen(false)
      setSelectedClient(null)
    } catch {
      setError("Error al actualizar el cliente")
    }
  }

  const handleCloseModal = async () => {
    setIsModalOpen(false)
    try {
      await loadClients()
    } catch {
      setError("Error al recargar clientes.")
    }
  }

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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Clientes</h1>
            <p className="text-muted-foreground mt-1">Gestiona las cuentas de Instagram de tus clientes</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto" variant="gradient">
            <Icons.Plus />
            Agregar Cliente
          </Button>
        </div>

        <AddClientModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleAddClient} />

        <EditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateClient}
          client={selectedClient}
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
                  onEdit={(client) => {
                    setSelectedClient(client)
                    setIsEditModalOpen(true)
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
