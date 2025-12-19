"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal } from "../../../../shared/components/ui/Modal"
import { Button } from "../../../../shared/components/ui/Button"
import { Input } from "../../../../shared/components/ui/Input"
import { Alert } from "../../../../shared/components/ui/Alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useApp } from "../../../../shared/hooks/useApp"

/* ===============================
   Logo X
================================ */
const XLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { setOauthCompleted } = useApp()

  const [validationErrors, setValidationErrors] = useState<{
    name?: string
    username?: string
  }>({})

  /* ===============================
     Effects
  ================================ */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  /**
   * 📩 Escuchar resultado del OAuth de X
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === "X_OAUTH_SUCCESS") {
        setSuccess(true)
        setTimeout(() => {
          handleReset()
          setOauthCompleted(true)
        }, 1500)
      }

      if (event.data?.type === "X_OAUTH_ERROR") {
        setError(event.data.error || "Error en la autenticación con X")
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [setOauthCompleted])

  /* ===============================
     Validaciones
  ================================ */
  const validateName = (value: string) => {
    if (!value.trim()) return "El nombre es requerido"
    if (value.length > 100) return "Máximo 100 caracteres"
    return undefined
  }

  const validateUsername = (value: string) => {
    if (!value.trim()) return "El usuario es requerido"
    if (value.includes("@")) return "No incluyas el @"
    if (value.length < 3) return "Mínimo 3 caracteres"
    if (value.length > 30) return "Máximo 30 caracteres"
    if (!/^[a-zA-Z0-9._]+$/.test(value))
      return "Solo letras, números, puntos y guiones bajos"
    return undefined
  }

  /* ===============================
     Handlers
  ================================ */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    setValidationErrors(prev => ({
      ...prev,
      name: validateName(value),
    }))
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setValidationErrors(prev => ({
      ...prev,
      username: validateUsername(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const nameError = validateName(name)
    const usernameError = validateUsername(username)

    if (nameError || usernameError) {
      setValidationErrors({ name: nameError, username: usernameError })
      setError("Por favor corrige los errores")
      return
    }

    const clientData = {
      name: name.trim(),
      username: username.trim(),
      description: description.trim() || undefined,
    }

    try {
      // 1️⃣ Llamar al backend para iniciar OAuth
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/x/auth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error("No se pudo iniciar OAuth con X")
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error("URL de OAuth inválida")
      }

      window.open(
        data.url,
        "x_oauth",
        "width=600,height=700,toolbar=no,menubar=no,scrollbars=yes,resizable=yes"
      )

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error al conectar con X")
    }
  }

  const handleReset = () => {
    setName("")
    setUsername("")
    setDescription("")
    setError(null)
    setSuccess(false)
    setValidationErrors({})
  }

  const handleCancel = () => {
    handleReset()
    onClose()
  }

  /* ===============================
     Render
  ================================ */
  return (
    <>
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Cuenta conectada con X exitosamente!
        </Alert>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Conectar Cuenta de X"
        description="Ingresa los datos para conectar una nueva cuenta de X"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="name"
            label="Nombre de la cuenta"
            placeholder="Ej: Mi Marca Oficial"
            value={name}
            onChange={handleNameChange}
            error={validationErrors.name}
          />

          <Input
            id="username"
            label="Usuario de X"
            placeholder="usuario_x"
            value={username}
            onChange={handleUsernameChange}
            leftIcon={<span className="text-muted-foreground">@</span>}
            error={validationErrors.username}
          />

          <Input
            id="description"
            label="Descripción (opcional)"
            placeholder="Breve descripción de la cuenta"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white"
            >
              <XLogo className="w-5 h-5 mr-2" />
              Conectar con X
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
