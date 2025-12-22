"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Upload,
} from "lucide-react"

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
import type { ClientDB } from "../../../core/types"

/* =========================
   Constantes
========================= */
const MAX_MEDIA_SIZE = 100 * 1024 * 1024
const MAX_TEXT_LENGTH = 280
// const MAX_SCHEDULE_DAYS = 29

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]

/* =========================
   Logo X
========================= */
const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function XSchedulePostPage() {
  const { clients, setCurrentPage } = useApp()

  const [clientId, setClientId] = useState("")
  const [selectedClient, setSelectedClient] = useState<ClientDB | null>(null)

  const [text, setText] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const filteredClients = useMemo(
    () => clients.filter((c) => c.social_identity === "X"),
    [clients]
  )

  /* =========================
     Helpers fecha
  ========================= */
  const getMinDate = () => new Date().toISOString().split("T")[0]

  const toISO = (date: string, time: string): string => {
    const [h, m] = time.split(":").map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  /* =========================
     Cliente
  ========================= */
  const handleClientChange = async (id: string) => {
    setClientId(id)
    setSelectedClient(null)

    if (!id) return

    setIsLoadingClient(true)
    try {
      const res = await apiClient.getClientById(Number(id))
      setSelectedClient(res.client ?? null)
    } finally {
      setIsLoadingClient(false)
    }
  }

  /* =========================
     Media
  ========================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_MEDIA_SIZE) {
      setError("El archivo excede 100 MB")
      return
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_VIDEO_TYPES.includes(file.type)
    ) {
      setError("Formato de archivo no soportado")
      return
    }

    setMediaFile(file)
    setError(null)
  }

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!clientId || !text.trim()) {
      setError("Completa todos los campos requeridos")
      return
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setError("El texto excede 280 caracteres")
      return
    }

    setIsLoading(true)
    setUploadProgress("Preparando publicación en X...")

    try {
      const formData = new FormData()
      formData.append("client_id", clientId)
      formData.append("text", text)

      if (mediaFile) {
        formData.append("media", mediaFile)
      }

      // 👉 SOLO esto decide el modo
      if (scheduledDate && scheduledTime) {
        const scheduledISO = toISO(scheduledDate, scheduledTime)
        formData.append("scheduled_at", scheduledISO)
      } else {
        formData.append("publish_now", "true")
      }

      setUploadProgress("Enviando al servidor...")

      await apiXPosts.create(formData)

      setSuccess(true)
      setTimeout(() => setCurrentPage("x-publications"), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar")
    } finally {
      setIsLoading(false)
      setUploadProgress(null)
    }
  }


  /* =========================
     Auto clear alerts
  ========================= */
  useEffect(() => {
    if (!error && !success) return
    const t = setTimeout(() => {
      setError(null)
      setSuccess(false)
    }, 4000)
    return () => clearTimeout(t)
  }, [error, success])

  /* =========================
     Render
  ========================= */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="error" icon={<AlertCircle />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle />}>
          Publicación creada correctamente
        </Alert>
      )}

      {uploadProgress && (
        <Alert variant="info" icon={<Loader2 className="animate-spin" />}>
          {uploadProgress}
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <XLogo className="w-12 h-12" />
        <div>
          <h1 className="text-2xl font-bold">Programar Post en X</h1>
          <p className="text-muted-foreground">
            Publicaciones inmediatas o programadas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Detalles</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Cuenta"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              disabled={isLoadingClient}
            >
              <option value="">Selecciona una cuenta de X</option>
              {filteredClients.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} (@{c.username})
                </option>
              ))}
            </Select>

            <Textarea
              label="Texto"
              value={text}
              onChange={(e) => setText(e.target.value)}
              helperText={`${text.length}/${MAX_TEXT_LENGTH}`}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Media (opcional)</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{mediaFile ? mediaFile.name : "Subir archivo"}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <Input
              type="date"
              label="Fecha"
              value={scheduledDate}
              min={getMinDate()}
              onChange={(e) => setScheduledDate(e.target.value)}
              leftIcon={<Calendar />}
            />

            <Input
              type="time"
              label="Hora"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              leftIcon={<Clock />}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage("dashboard")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
