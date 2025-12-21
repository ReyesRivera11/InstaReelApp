"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"

import { AlertCircle, Calendar, CheckCircle, Clock, Loader2, Upload } from "lucide-react"
import { apiClient } from "../../../shared/services/api/reels/apiClients"
import { appReelss } from "../../../shared/services/api/reels/apiPublications"
import { Alert, Button, Card, CardContent, CardHeader, Input, Select, Textarea } from "../../../shared/components/ui"
import { useApp } from "../../../shared/hooks/useApp"
import type { ClientDB } from "../../../core/types"

const MAX_MEDIA_SIZE = 100 * 1024 * 1024 // 100 MB
const MIN_TEXT_LENGTH = 1
const MAX_TEXT_LENGTH = 280
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]
const MAX_SCHEDULE_DAYS = 29

// Logo
const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export default function XSchedulePostPage() {
  const { clients, setCurrentPage } = useApp()

  const [clientId, setClientId] = useState("")
  const [selectedClientData, setSelectedClientData] = useState<ClientDB | null>(null)
  const [text, setText] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  const [validationErrors, setValidationErrors] = useState<{
    text?: string
    media?: string
    date?: string
    client?: string
  }>({})

  // Filtro X
  const filteredClients = useMemo(() => {
    return clients.filter((client) => client.social_identity === "X");
  }, [clients]);

  const getMinDateTime = () => {
    const now = new Date()
    const minTime = new Date(now.getTime() + 15 * 60 * 1000)

    const year = minTime.getFullYear()
    const month = String(minTime.getMonth() + 1).padStart(2, "0")
    const day = String(minTime.getDate()).padStart(2, "0")
    const hours = String(minTime.getHours()).padStart(2, "0")
    const minutes = String(minTime.getMinutes()).padStart(2, "0")

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    }
  }

  const getMaxDate = () => {
    const today = new Date()
    const maxDate = new Date(today.getTime() + MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000)
    const year = maxDate.getFullYear()
    const month = String(maxDate.getMonth() + 1).padStart(2, "0")
    const day = String(maxDate.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getMinDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const getMinTime = () => {
    if (!scheduledDate) return undefined
    const today = getMinDate()
    return scheduledDate === today ? getMinDateTime().time : "00:00"
  }

  const handleClientChange = async (newClientId: string) => {
    setClientId(newClientId)
    setValidationErrors(prev => ({ ...prev, client: undefined }))

    if (!newClientId) {
      setSelectedClientData(null)
      return
    }

    setIsLoadingClient(true)
    try {
      const response = await apiClient.getClientById(Number.parseInt(newClientId))
      if (response.client) {
        setSelectedClientData(response.client)
      } else {
        setError(response.error || "Error al obtener datos del cliente")
        setSelectedClientData(null)
      }
    } catch {
      setError("Error al cargar los datos del cliente")
      setSelectedClientData(null)
    } finally {
      setIsLoadingClient(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!clientId) {
      errors.client = "Debes seleccionar una cuenta"
    }

    if (text.length < MIN_TEXT_LENGTH) {
      errors.text = "El texto es requerido"
    } else if (text.length > MAX_TEXT_LENGTH) {
      errors.text = `El texto no puede exceder ${MAX_TEXT_LENGTH} caracteres`
    }

    if (mediaFile) {
      if (mediaFile.size > MAX_MEDIA_SIZE) {
        errors.media = `El archivo no puede exceder 100 MB`
      } else if (mediaType === "image" && !ALLOWED_IMAGE_TYPES.includes(mediaFile.type)) {
        errors.media = "Formato de imagen no válido. Usa JPEG, PNG o GIF"
      } else if (mediaType === "video" && !ALLOWED_VIDEO_TYPES.includes(mediaFile.type)) {
        errors.media = "Formato de video no válido. Usa MP4, MOV o AVI"
      }
    }

    if (!scheduledDate || !scheduledTime) {
      errors.date = "Debes seleccionar fecha y hora de publicación"
    } else {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const now = new Date()
      const minScheduleTime = new Date(now.getTime() + 15 * 60 * 1000)
      const maxScheduleTime = new Date(now.getTime() + MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000)

      if (scheduledDateTime <= minScheduleTime) {
        errors.date = "La fecha debe ser al menos 15 minutos en el futuro"
      } else if (scheduledDateTime > maxScheduleTime) {
        errors.date = `No puedes programar más de ${MAX_SCHEDULE_DAYS} días en el futuro`
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const toLocalISO = (date: string, time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const localDate = new Date()
    localDate.setFullYear(Number(date.split("-")[0]))
    localDate.setMonth(Number(date.split("-")[1]) - 1)
    localDate.setDate(Number(date.split("-")[2]))
    localDate.setHours(hours)
    localDate.setMinutes(minutes)
    localDate.setSeconds(0)
    localDate.setMilliseconds(0)

    const tzOffset = -localDate.getTimezoneOffset()
    const sign = tzOffset >= 0 ? "+" : "-"
    const diffHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0")
    const diffMinutes = String(Math.abs(tzOffset) % 60).padStart(2, "0")
    const offset = `${sign}${diffHours}:${diffMinutes}`

    return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}T${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(2, "0")}:00${offset}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Por favor corrige los errores en el formulario")
      return
    }

    if (!selectedClientData) {
      setError("No se pudieron cargar los datos de la cuenta")
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadProgress("Preparando publicación en X...")

    try {
      const formData = new FormData()
      formData.append("client_id", clientId)
      formData.append("text", text)
      const scheduledDateTime = toLocalISO(scheduledDate, scheduledTime)
      formData.append("scheduled_date", scheduledDateTime)
      formData.append("social_identity", "X")
      if (mediaFile) formData.append("media", mediaFile)

      setUploadProgress("Enviando al servidor...")

      const response = await appReelss.scheduleReel(formData)
      if (response.success === false) {
        throw new Error(response.error || "Error al programar el post")
      }

      setSuccess(true)
      setClientId("")
      setText("")
      setMediaFile(null)
      setMediaType("none")
      setScheduledDate("")
      setScheduledTime("")
      setSelectedClientData(null)
      setValidationErrors({})
      setUploadProgress("")

      setTimeout(() => {
        setCurrentPage("publications")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al programar el post. Intenta nuevamente.")
      setUploadProgress("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const errors: typeof validationErrors = { ...validationErrors }

    let detectedType: "image" | "video" | "none" = "none"
    if (file.type.startsWith("image/")) detectedType = "image"
    if (file.type.startsWith("video/")) detectedType = "video"

    if (detectedType === "image" && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.media = "Formato de imagen no soportado (JPEG, PNG o GIF)"
    } else if (detectedType === "video" && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.media = "Formato de video no soportado (MP4, MOV o AVI)"
    } else if (file.size > MAX_MEDIA_SIZE) {
      errors.media = "El archivo no puede exceder 100 MB"
    } else {
      delete errors.media
      setMediaFile(file)
      setMediaType(detectedType)
      setValidationErrors(errors)
      return
    }

    setValidationErrors(errors)
    setMediaFile(null)
    setMediaType("none")
  }

  const handleTimeChange = (newTime: string) => {
    if (!scheduledDate) {
      setScheduledTime(newTime)
      return
    }

    const today = getMinDate()
    const minTime = getMinDateTime().time

    if (scheduledDate === today && newTime < minTime) {
      setScheduledTime(minTime)
      setValidationErrors(prev => ({ ...prev, date: "La hora debe ser posterior a la actual" }))
    } else {
      setScheduledTime(newTime)
      setValidationErrors(prev => ({ ...prev, date: undefined }))
    }
  }

  const handleTimeFocus = () => {
    if (scheduledDate === getMinDate() && (!scheduledTime || scheduledTime < getMinDateTime().time)) {
      setScheduledTime(getMinDateTime().time)
    }
  }

  useEffect(() => {
    if (scheduledDate === getMinDate() && !scheduledTime) {
      setScheduledTime(getMinDateTime().time)
    }
  }, [scheduledDate])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(false)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Post programado en X exitosamente! Redirigiendo...
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <XLogo className="w-12 h-12" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Programar Post en X</h1>
          <p className="text-muted-foreground">Crea y programa una publicación con texto, imágenes o videos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Detalles de la Publicación</h2>
          <p className="text-sm text-muted-foreground">Completa la información del post que deseas programar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {clients.length === 0 ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  No tienes cuentas conectadas. Agrega una primero.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage("clients")}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Ir a Mis Cuentas
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  label="Cuenta"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  error={validationErrors.client}
                  disabled={isLoadingClient || filteredClients.length === 0}
                >
                  <option value="">Selecciona una cuenta de X</option>
                  {filteredClients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name} (@{client.username})
                    </option>
                  ))}
                </Select>
                {isLoadingClient && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando datos de la cuenta...
                  </div>
                )}
                {filteredClients.length === 0 && (
                  <div className="mt-2 text-sm text-amber-600">
                    No tienes cuentas de X conectadas. Ve a "Mis Cuentas" para agregar una.
                  </div>
                )}
                {selectedClientData && !isLoadingClient && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-900 dark:text-green-300">
                      ✓ Cuenta cargada: {selectedClientData.name} (@{selectedClientData.username})
                    </p>
                  </div>
                )}
              </div>
            )}

            <Textarea
              label="Texto del Post"
              placeholder="Escribe el texto de tu post en X... (máx. 280 caracteres)"
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setValidationErrors(prev => ({ ...prev, text: undefined }))
              }}
              required
              rows={6}
              helperText={`${text.length}/${MAX_TEXT_LENGTH} caracteres`}
              error={validationErrors.text}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Media (opcional)</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-input-background hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media"
                  disabled={isLoading}
                />
                <label htmlFor="media" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  {mediaFile ? (
                    <div className="text-center">
                      <p className="font-medium text-foreground">{mediaFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB • {mediaType === "image" ? "Imagen" : "Video"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground">
                      Haz clic para subir una imagen o video
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG, GIF, MP4, MOV, AVI · máx. 100 MB
                  </p>
                </label>
              </div>
              {validationErrors.media && (
                <p className="text-sm text-destructive">{validationErrors.media}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha de publicación"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
                error={validationErrors.date}
                disabled={isLoading}
              />

              <Input
                type="time"
                label="Hora de publicación"
                value={scheduledTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                onFocus={handleTimeFocus}
                min={getMinTime()}
                step="60"
                required
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={isLoading}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Puedes programar hasta {MAX_SCHEDULE_DAYS} días en el futuro
            </div>

            {isLoading && uploadProgress && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-900 dark:text-blue-300">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage("dashboard")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || filteredClients.length === 0}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Programando...
                  </>
                ) : (
                  "Programar Post"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}