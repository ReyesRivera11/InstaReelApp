"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Upload,
  Link2,
  ShieldCheck,
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

  // OAuth 1.0a
  const [oauth1Started, setOauth1Started] = useState(false)
  const [oauth1Ready, setOauth1Ready] = useState(false)

  const [text, setText] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const oauthPopupRef = useRef<Window | null>(null)


  const filteredClients = useMemo(
    () => clients.filter((c) => c.social_identity === "X"),
    [clients]
  )

  /* =========================
     Escuchar OAuth success (popup)
  ========================= */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const allowedOrigins = [
        window.location.origin,                // frontend
        import.meta.env.VITE_API_URL?.replace("/api", ""), // backend
      ]

      if (!allowedOrigins.includes(event.origin)) return

      if (event.data?.type === "X_OAUTH1_SUCCESS") {
        setOauth1Ready(true)
        setInfo("✅ Cuenta de X autorizada para subir contenido multimedia")
      }
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])


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

    // reset OAuth states al cambiar cuenta
    setOauth1Ready(false)
    setOauth1Started(false)
    setInfo(null)

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
    if (!clientId) {
      setError("Selecciona una cuenta de X antes de subir media")
      return
    }

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

    if (mediaFile && !oauth1Ready) {
      setError("Debes autorizar X antes de publicar con media")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("client_id", clientId)
      formData.append("text", text)

      if (mediaFile) {
        formData.append("media", mediaFile)
      }

      if (scheduledDate && scheduledTime) {
        formData.append("scheduled_at", toISO(scheduledDate, scheduledTime))
      } else {
        formData.append("publish_now", "true")
      }

      await apiXPosts.create(formData)

      setSuccess(true)
      setTimeout(() => setCurrentPage("x-publications"), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar")
    } finally {
      setIsLoading(false)
    }
  }

  /* =========================
     Auto clear alerts
  ========================= */
  useEffect(() => {
    if (!error && !success && !info) return
    const t = setTimeout(() => {
      setError(null)
      setSuccess(false)
      setInfo(null)
    }, 4000)
    return () => clearTimeout(t)
  }, [error, success, info])

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

      {info && (
        <Alert variant="info" icon={<Loader2 className="animate-spin" />}>
          {info}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle />}>
          Publicación creada correctamente
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
                  disabled={!clientId}
                />
              </label>

              {!clientId && (
                <p className="text-xs text-yellow-600">
                  Selecciona una cuenta de X antes de subir media
                </p>
              )}

              {mediaFile && !oauth1Ready && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!clientId) return

                    const oauthUrl =
                      `${import.meta.env.VITE_API_URL}/x/oauth1/connect?client_id=${clientId}`

                    const width = 600
                    const height = 700
                    const left = window.screenX + (window.outerWidth - width) / 2
                    const top = window.screenY + (window.outerHeight - height) / 2

                    window.open(
                      oauthUrl,
                      "x-oauth1-popup",
                      `width=${width},height=${height},left=${left},top=${top}`
                    )

                    setInfo("🔐 Autoriza la cuenta de X en la ventana emergente")
                  }}
                >
                  🔐 Autorizar X para subir media
                </Button>

              )}

              {oauth1Ready && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  X autorizado para subir media
                </p>
              )}
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

              <Button
                type="submit"
                disabled={isLoading || (mediaFile && !oauth1Ready)}
              >
                {isLoading ? "Publicando..." : "Publicar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
