"use client"

import type React from "react"

import { useState, useEffect } from "react"

import { AlertCircle, Calendar, CheckCircle, Clock, Loader2, Upload } from "lucide-react"
import { useApp } from "../../shared/hooks/useApp"
import { metaApi } from "../../shared/services/api/apiMeta"
import { appPublications } from "../../shared/services/api/apiPublications"
import { Alert, Button, Card, CardContent, CardHeader, Input, Select, Textarea } from "../../shared/components/ui"


const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB in bytes
const MIN_TITLE_LENGTH = 3
const MAX_TITLE_LENGTH = 100
const MIN_DESCRIPTION_LENGTH = 1
const MAX_DESCRIPTION_LENGTH = 2200 // Instagram caption limit
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"]

export function ScheduleReelPage() {
  const { clients, setCurrentPage } = useApp()
  const [clientId, setClientId] = useState<number | "">("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  const [validationErrors, setValidationErrors] = useState<{
    title?: string
    description?: string
    video?: string
    date?: string
    client?: string
  }>({})

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {}

    if (!clientId) {
      errors.client = "Debes seleccionar un cliente"
    }

    if (title.length < MIN_TITLE_LENGTH) {
      errors.title = `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = `El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      errors.description = "La descripción es requerida"
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`
    }

    if (!videoFile) {
      errors.video = "Debes seleccionar un archivo de video"
    } else if (videoFile.size > MAX_VIDEO_SIZE) {
      errors.video = `El video no puede exceder ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
    } else if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
      errors.video = "Formato de video no válido. Usa MP4, MOV o AVI"
    }

    if (!scheduledDate || !scheduledTime) {
      errors.date = "Debes seleccionar fecha y hora de publicación"
    } else {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const now = new Date()
      if (scheduledDateTime <= now) {
        errors.date = "La fecha de publicación debe ser futura"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
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

    const selectedClient = clients.find((c) => c.id === clientId)
    if (!selectedClient) {
      setError("Cliente no encontrado")
      return
    }

    if (!selectedClient.access_token) {
      setError("El cliente no está autenticado con Instagram")
      return
    }

    if (!selectedClient.idInsta) {
      setError("El cliente no tiene un ID de Instagram configurado")
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadProgress("Iniciando...")

    try {
      setUploadProgress("Creando contenedor de media...")
      console.log("[v0] Creating media container for Instagram ID:", selectedClient.idInsta)

      const containerResponse = await metaApi.createMediaContainer(selectedClient.idInsta, {
        upload_type: "resumable",
        media_type: "REELS",
        access_token: selectedClient.access_token,
        caption: description,
      })
      if (!containerResponse.id || !containerResponse.uri) {
        throw new Error("No se recibió el ID del contenedor o la URL de subida")
      }

      console.log("[v0] Container created:", containerResponse.id)

      const videoSize = videoFile.size
      setUploadProgress(`Subiendo video (${(videoSize / (1024 * 1024)).toFixed(2)}MB)...`)
      console.log("[v0] Uploading video, size:", videoSize, "bytes")

      const uploadResponse = await metaApi.uploadVideoBinary(
        containerResponse.uri,
        selectedClient.access_token,
        videoFile,
        videoSize,
      )

      if (!uploadResponse.success) {
        throw new Error("Error al subir el video")
      }

      console.log("[v0] Video uploaded successfully")

      setUploadProgress("Guardando publicación...")
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

      const publicationData = {
        clientId: clientId as number,
        title,
        description,
        videoUrl: URL.createObjectURL(videoFile),
        scheduledDate: scheduledDateTime.toISOString(),
        status: "scheduled" as const,
        containerId: containerResponse.id,
        videoSize,
      }

      const saveResponse = await appPublications.createPublication(publicationData)

      if (!saveResponse.success) {
        throw new Error(saveResponse.error || "Error al guardar la publicación")
      }

      console.log("[v0] Publication saved successfully")

      setSuccess(true)
      setClientId("")
      setTitle("")
      setDescription("")
      setVideoFile(null)
      setScheduledDate("")
      setScheduledTime("")
      setValidationErrors({})
      setUploadProgress("")

      // Redirect after 2 seconds
      setTimeout(() => {
        setCurrentPage("publications")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el cliente. Por favor intenta de nuevo.")
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
      errors.video = "Por favor selecciona un archivo de video válido"
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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2">{error}</div>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <div className="ml-2">¡Reel programado exitosamente! Redirigiendo...</div>
        </Alert>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Programar Reel</h1>
        <p className="text-muted-foreground">Crea y programa una nueva publicación de Instagram Reel</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Detalles de la Publicación</h2>
          <p className="text-sm text-muted-foreground">Completa la información del reel que deseas programar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {clients.length === 0 ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  No tienes clientes registrados. Por favor, agrega un cliente primero.
                </p>
                <button
                  type="button"
                  className="text-sm text-purple-600 hover:underline mt-2"
                  onClick={() => setCurrentPage("clients")}
                >
                  Ir a Mis Clientes
                </button>
              </div>
            ) : (
              <Select
                id="client"
                label="Cliente"
                value={clientId.toString()}
                onChange={(e) => {
                  setClientId(e.target.value ? Number(e.target.value) : "")
                  setValidationErrors({
                    ...validationErrors,
                    client: undefined,
                  })
                }}
                required
                error={validationErrors.client}
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (@{client.username}){!client.access_token && " - No autenticado"}
                  </option>
                ))}
              </Select>
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
              helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH} caracteres. Incluye hashtags y menciones si es necesario`}
              error={validationErrors.description}
            />

            <div className="space-y-2">
              <label htmlFor="video" className="text-sm font-medium">
                Archivo de Video
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-background hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  id="video"
                  accept="video/*"
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
                onChange={(e) => {
                  setScheduledDate(e.target.value)
                  setValidationErrors({ ...validationErrors, date: undefined })
                }}
                required
                min={new Date().toISOString().split("T")[0]}
                leftIcon={<Calendar className="w-4 h-4" />}
                error={validationErrors.date}
                disabled={isLoading}
              />

              <Input
                type="time"
                id="time"
                label="Hora de Publicación"
                value={scheduledTime}
                onChange={(e) => {
                  setScheduledTime(e.target.value)
                  setValidationErrors({ ...validationErrors, date: undefined })
                }}
                required
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={isLoading}
              />
            </div>

            {isLoading && uploadProgress && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-900 dark:text-blue-300">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setCurrentPage("dashboard")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={clients.length === 0 || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Programando...
                  </>
                ) : (
                  "Programar Reel"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
