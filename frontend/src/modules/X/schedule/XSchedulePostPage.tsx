"use client"

import { useState, useEffect } from "react"

import { apiClient } from "../../../shared/services/api/reels/apiClients"
import { apiXPosts } from "../../../shared/services/api/x/apiXPosts"

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Select,
  Textarea,
} from "../../../shared/components/ui"

import { useApp } from "../../../shared/hooks/useApp"

/* ============================
   Constantes
============================ */
const MAX_MEDIA_SIZE = 100 * 1024 * 1024
const MAX_TEXT_LENGTH = 280
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]
const MAX_SCHEDULE_DAYS = 29

const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function XSchedulePostPage() {
  const { clients, setCurrentPage } = useApp()

  const [clientId, setClientId] = useState("")
  const [text, setText] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none")

  const [publishMode, setPublishMode] =
    useState<"NOW" | "SCHEDULED">("SCHEDULED")

  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [validationErrors, setValidationErrors] = useState<{
    client?: string
    text?: string
    media?: string
    date?: string
  }>({})

  /* ============================
     Helpers fecha / hora
  ============================ */
  const getMinDate = () => new Date().toISOString().split("T")[0]

  const getMaxDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + MAX_SCHEDULE_DAYS)
    return d.toISOString().split("T")[0]
  }

  const toLocalISO = (date: string, time: string) => {
    const [h, m] = time.split(":").map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  /* ============================
     Cliente
  ============================ */
  const handleClientChange = async (id: string) => {
    setClientId(id)
    setValidationErrors((p) => ({ ...p, client: undefined }))

    if (!id) return

    try {
      await apiClient.getClientById(Number(id))
    } catch {
      setError("Error al cargar la cuenta")
    }
  }

  /* ============================
     Validación
  ============================ */
  const validateForm = () => {
    const errors: typeof validationErrors = {}

    if (!clientId) errors.client = "Selecciona una cuenta"
    if (!text || text.length > MAX_TEXT_LENGTH)
      errors.text = "Texto inválido"

    if (mediaFile) {
      if (mediaFile.size > MAX_MEDIA_SIZE) {
        errors.media = "Archivo demasiado grande"
      } else if (
        mediaType === "image" &&
        !ALLOWED_IMAGE_TYPES.includes(mediaFile.type)
      ) {
        errors.media = "Imagen no válida"
      } else if (
        mediaType === "video" &&
        !ALLOWED_VIDEO_TYPES.includes(mediaFile.type)
      ) {
        errors.media = "Video no válido"
      }
    }

    if (publishMode === "SCHEDULED") {
      if (!scheduledDate || !scheduledTime) {
        errors.date = "Fecha y hora requeridas"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ============================
     Submit
  ============================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("client_id", clientId)
      formData.append("text", text)

      if (publishMode === "NOW") {
        formData.append("publish_now", "true")
      } else {
        formData.append(
          "scheduled_at",
          toLocalISO(scheduledDate, scheduledTime)
        )
      }

      if (mediaFile) formData.append("media", mediaFile)

      const res = await apiXPosts.create(formData)
      if (!res.success) throw new Error("Error al crear el post")

      setSuccess(true)
      setText("")
      setMediaFile(null)
      setMediaType("none")
      setScheduledDate("")
      setScheduledTime("")
      setPublishMode("SCHEDULED")

      setTimeout(() => setCurrentPage("publications"), 1500)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Error inesperado")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaFile(file)
    setMediaType(file.type.startsWith("video") ? "video" : "image")
  }

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError(null)
        setSuccess(false)
      }, 4000)
      return () => clearTimeout(t)
    }
  }, [error, success])

  /* ============================
     Render
  ============================ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">Post enviado a X</Alert>}

      <div className="flex items-center gap-4">
        <XLogo className="w-10 h-10" />
        <h1 className="text-3xl font-bold">
          {publishMode === "NOW"
            ? "Publicar en X"
            : "Programar post en X"}
        </h1>
      </div>

      <Card>
        <CardHeader>Detalles del Post</CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Cuenta"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              error={validationErrors.client}
            >
              <option value="">Selecciona una cuenta</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (@{c.username})
                </option>
              ))}
            </Select>

            <Textarea
              label="Texto"
              value={text}
              onChange={(e) => setText(e.target.value)}
              helperText={`${text.length}/${MAX_TEXT_LENGTH}`}
              error={validationErrors.text}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant={publishMode === "NOW" ? "primary" : "outline"}
                onClick={() => setPublishMode("NOW")}
              >
                Publicar ahora
              </Button>
              <Button
                type="button"
                variant={publishMode === "SCHEDULED" ? "primary" : "outline"}
                onClick={() => setPublishMode("SCHEDULED")}
              >
                Programar
              </Button>
            </div>

            {publishMode === "SCHEDULED" && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  label="Fecha"
                  value={scheduledDate}
                  min={getMinDate()}
                  max={getMaxDate()}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <Input
                  type="time"
                  label="Hora"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            )}

            <input type="file" accept="image/*,video/*" onChange={handleFileChange} />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage("dashboard")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
