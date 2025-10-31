"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Button, Input, Select, Textarea, Card, CardHeader, CardContent, Alert } from "../../../shared/components/ui"
import { useApp } from "../../../shared/hooks/useApp"
import { AlertCircle, Calendar, CheckCircle, Clock, Loader2, Upload } from "lucide-react"
import type { ClientDB } from "../../../core/types"
import { apiClient } from "../../../shared/services/api/reels/apiClients"
import { appReelss } from "../../../shared/services/api/reels/apiPublications"

const MAX_VIDEO_SIZE = 100 * 1024 * 1024
const MIN_TITLE_LENGTH = 3
const MAX_TITLE_LENGTH = 100
const MIN_DESCRIPTION_LENGTH = 1
const MAX_DESCRIPTION_LENGTH = 2200
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]
const MAX_SCHEDULE_DAYS = 29

interface FacebookPage {
  access_token: string
  name: string
  id: string
  category?: string
  category_list?: Array<{ id: string; name: string }>
  tasks?: string[]
}

export default function ScheduleFacebookReelPage() {
  const { clients, setCurrentPage } = useApp()
  const [clientId, setClientId] = useState("")
  const [selectedClientData, setSelectedClientData] = useState<ClientDB | null>(null)

  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([])
  const [selectedPageId, setSelectedPageId] = useState("")
  const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null)
  const [isLoadingPages, setIsLoadingPages] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    description?: string
    video?: string
    date?: string
    client?: string
    page?: string
  }>({})

  const fetchFacebookPages = async (accessToken: string) => {
    setIsLoadingPages(true)
    setFacebookPages([])
    setSelectedPageId("")
    setSelectedPage(null)

    try {
      const response = await fetch(`https://graph.facebook.com/v24.0/me/accounts?access_token=${accessToken}`)

      if (!response.ok) {
        throw new Error("Error al obtener las páginas de Facebook")
      }

      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        setFacebookPages(data.data)
      } else {
        throw new Error("No se encontraron páginas")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las páginas de Facebook")
      setFacebookPages([])
    } finally {
      setIsLoadingPages(false)
    }
  }

  const handleClientChange = async (newClientId: string) => {
    setClientId(newClientId)
    setValidationErrors({ ...validationErrors, client: undefined })

    setFacebookPages([])
    setSelectedPageId("")
    setSelectedPage(null)

    if (!newClientId) {
      setSelectedClientData(null)
      return
    }

    setIsLoadingClient(true)
    try {
      const response = await apiClient.getClientById(Number.parseInt(newClientId))
      if (response.client) {
        setSelectedClientData(response.client)
        if (response.client.long_lived_token) await fetchFacebookPages(response.client.long_lived_token)
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

  const handlePageChange = (pageId: string) => {
    setSelectedPageId(pageId)
    setValidationErrors({ ...validationErrors, page: undefined })

    if (!pageId) {
      setSelectedPage(null)
      return
    }

    const page = facebookPages.find((p) => p.id === pageId)
    if (page) {
      setSelectedPage(page)
    }
  }

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

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!clientId) errors.client = "Debes seleccionar una página de Facebook"

    if (!selectedPageId) errors.page = "Debes seleccionar una página de Facebook"

    if (title.length < MIN_TITLE_LENGTH) errors.title = `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`
    else if (title.length > MAX_TITLE_LENGTH) errors.title = `El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`

    if (description.length < MIN_DESCRIPTION_LENGTH) errors.description = "La descripción es requerida"
    else if (description.length > MAX_DESCRIPTION_LENGTH)
      errors.description = `La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`

    if (!videoFile) errors.video = "Debes seleccionar un archivo de video"
    else if (videoFile.size > MAX_VIDEO_SIZE)
      errors.video = `El video no puede exceder ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
    else if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type))
      errors.video = "Formato de video no válido. Usa MP4, MOV o AVI"

    if (!scheduledDate || !scheduledTime) {
      errors.date = "Debes seleccionar fecha y hora de publicación"
    } else {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const now = new Date()
      const minScheduleTime = new Date(now.getTime() + 15 * 60 * 1000)
      const maxScheduleTime = new Date(now.getTime() + MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000)

      if (scheduledDateTime <= minScheduleTime) {
        errors.date = "La fecha de publicación debe ser al menos 15 minutos en el futuro"
      } else if (scheduledDateTime > maxScheduleTime) {
        errors.date = `La fecha de publicación no puede ser más de ${MAX_SCHEDULE_DAYS} días en el futuro`
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function toLocalISO(date: string, time: string) {
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

    const isoLocal = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(
      localDate.getDate(),
    ).padStart(2, "0")}T${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(
      2,
      "0",
    )}:00${offset}`

    return isoLocal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      setError("Por favor corrige los errores en el formulario")
      return
    }

    if (!videoFile) {
      setError("Por favor selecciona un archivo de video")
      return
    }

    if (!selectedPage) {
      setError("No se pudieron cargar los datos de la página")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      setUploadProgress("Creando contenedor de video en Facebook...")

      setUploadProgress("Enviando video al backend para procesamiento...")
      const scheduledDateTime = toLocalISO(scheduledDate, scheduledTime)

      const formData = new FormData()
      formData.append("client_id", clientId)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("scheduled_date", scheduledDateTime)
      formData.append("reel", videoFile)
      formData.append("social_identity", "FACEBOOK")
      formData.append("page_access_token", selectedPage.access_token)
      formData.append("page_id", selectedPage.id)

      const response = await appReelss.scheduleReel(formData)
      console.log(response)
      if (response.success === false) {
        throw new Error("Error al programar el reel")
      }

      setSuccess(true)
      setClientId("")
      setTitle("")
      setDescription("")
      setVideoFile(null)
      setScheduledDate("")
      setScheduledTime("")
      setSelectedClientData(null)
      setFacebookPages([])
      setSelectedPageId("")
      setSelectedPage(null)
      setValidationErrors({})
      setUploadProgress("")

      setTimeout(() => setCurrentPage("facebook-publications"), 2000)
    } catch (err) {
      console.error("[v0] Error en handleSubmit:", err)
      setError(err instanceof Error ? err.message : "Error al programar el reel. Por favor intenta de nuevo.")
      setUploadProgress("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const errors: typeof validationErrors = { ...validationErrors }

    if (!file.type.startsWith("video/")) {
      errors.video = "Solo se permiten archivos de video (MP4, MOV, AVI)"
      setValidationErrors(errors)
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      errors.video = `El video no puede exceder ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
      setValidationErrors(errors)
      return
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.video = "Formato no soportado. Usa MP4, MOV o AVI"
      setValidationErrors(errors)
      return
    }

    delete errors.video
    setValidationErrors(errors)
    setVideoFile(file)
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
      setValidationErrors({
        ...validationErrors,
        date: "No puedes seleccionar una hora que ya pasó",
      })
    } else {
      setScheduledTime(newTime)
      if (validationErrors.date === "No puedes seleccionar una hora que ya pasó") {
        setValidationErrors({ ...validationErrors, date: undefined })
      }
    }
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

  const handleTimeFocus = () => {
    if (!scheduledDate) return
    const today = getMinDate()
    if (scheduledDate === today) {
      const { time } = getMinDateTime()
      if (!scheduledTime || scheduledTime < time) {
        setScheduledTime(time)
        setValidationErrors({
          ...validationErrors,
          date: undefined,
        })
      }
    }
  }

  useEffect(() => {
    if (scheduledDate) {
      const today = getMinDate()
      if (scheduledDate === today && !scheduledTime) {
        const { time } = getMinDateTime()
        setScheduledTime(time)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledDate])

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Reel de Facebook programado exitosamente! Redirigiendo...
        </Alert>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold ">Programar Reel de Facebook</h1>
        <p className="text-muted-foreground">Crea y programa un nuevo Reel para tu página de Facebook</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Detalles del Reel</h2>
          <p className="text-sm text-muted-foreground">Completa la información del reel que deseas programar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {clients.length === 0 ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  No tienes páginas registradas. Por favor, agrega una primero.
                </p>
                <button
                  type="button"
                  className="text-sm hover:cursor-pointer text-[#1877F2] hover:underline mt-2"
                  onClick={() => setCurrentPage("facebook-clients")}
                >
                  Ir a Mis Páginas
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  id="client"
                  label="Cliente / Cuenta"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  error={validationErrors.client}
                  disabled={isLoadingClient}
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name}
                    </option>
                  ))}
                </Select>
                {isLoadingClient && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando datos del cliente...</span>
                  </div>
                )}
                {selectedClientData && !isLoadingClient && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">✓ Cliente cargado: {selectedClientData.name}</p>
                  </div>
                )}
              </div>
            )}

            {selectedClientData && (
              <div className="space-y-2">
                <Select
                  id="facebook-page"
                  label="Página de Facebook"
                  value={selectedPageId}
                  onChange={(e) => handlePageChange(e.target.value)}
                  required
                  error={validationErrors.page}
                  disabled={isLoadingPages || facebookPages.length === 0}
                >
                  <option value="">
                    {isLoadingPages
                      ? "Cargando páginas..."
                      : facebookPages.length === 0
                        ? "No hay páginas disponibles"
                        : "Selecciona una página"}
                  </option>
                  {facebookPages.map((page) => (
                    <option key={page.id} value={page.id}>
                      {page.name}
                    </option>
                  ))}
                </Select>

                {isLoadingPages && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cargando páginas de Facebook...</span>
                  </div>
                )}

                {selectedPage && !isLoadingPages && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">✓ Página seleccionada: {selectedPage.name}</p>
                    {selectedPage.category && (
                      <p className="text-xs text-green-700 mt-1">Categoría: {selectedPage.category}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <Input
              id="title"
              label="Título del Reel"
              placeholder="Ingresa un título descriptivo"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setValidationErrors({ ...validationErrors, title: undefined })
              }}
              required
              error={validationErrors.title}
            />

            <Textarea
              id="description"
              label="Descripción / Caption"
              placeholder="Escribe la descripción que se publicará con el reel..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setValidationErrors({
                  ...validationErrors,
                  description: undefined,
                })
              }}
              required
              rows={5}
              helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH} caracteres`}
              error={validationErrors.description}
            />

            <div className="space-y-2">
              <label htmlFor="video" className="text-sm font-medium">
                Archivo de Video (solo formatos MP4, MOV, AVI)
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-input-background hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  id="video"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="video" className="flex flex-col items-center cursor-pointer">
                  <div className="text-muted-foreground mb-2">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-center">
                    {videoFile ? (
                      <>
                        <span className="font-medium text-foreground">{videoFile.name}</span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </>
                    ) : (
                      "Haz clic para seleccionar un video"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI (máx. 100MB)</p>
                </label>
              </div>
              {validationErrors.video && <p className="text-sm text-destructive">{validationErrors.video}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="date"
                id="date"
                label="Fecha de Publicación"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                min={getMinDate()}
                max={getMaxDate()}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={validationErrors.date}
                disabled={isLoading}
              />

              <Input
                type="time"
                id="time"
                label="Hora de Publicación"
                value={scheduledTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                onFocus={handleTimeFocus}
                required
                min={getMinTime()}
                step="60"
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={isLoading}
              />
            </div>

            <div className="text-xs text-muted-foreground -mt-2">
              Puedes programar tu reel hasta {MAX_SCHEDULE_DAYS} días en el futuro
            </div>

            {isLoading && uploadProgress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-900">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setCurrentPage("dashboard")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <button
                type="submit"
                disabled={clients.length === 0 || isLoading}
                className="px-4 hover:cursor-pointer py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Programando...
                  </>
                ) : (
                  "Programar Reel"
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
