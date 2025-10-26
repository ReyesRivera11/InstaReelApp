"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  Alert,
} from "../../shared/components/ui";
import { useApp } from "../../shared/hooks/useApp";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Upload,
} from "lucide-react";
import type { ClientDB } from "../../core/types";
import { apiClient } from "../../shared/services/api/apiClients";
import { metaApi } from "../../shared/services/api/apiMeta";
import { appPublications } from "../../shared/services/api/apiPublications";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 1;
const MAX_DESCRIPTION_LENGTH = 2200;
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

export default function ScheduleReelPage() {
  const { clients, setCurrentPage } = useApp();
  const [clientId, setClientId] = useState("");
  const [selectedClientData, setSelectedClientData] = useState<ClientDB | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    video?: string;
    date?: string;
    client?: string;
  }>({});

  const handleClientChange = async (newClientId: string) => {
    setClientId(newClientId);
    setValidationErrors({
      ...validationErrors,
      client: undefined,
    });

    if (!newClientId) {
      setSelectedClientData(null);
      return;
    }
    setIsLoadingClient(true);
    try {
      const response = await apiClient.getClientById(
        Number.parseInt(newClientId)
      );
      if (response.client) {
        setSelectedClientData(response.client);
      } else {
        setError(response.error || "Error al obtener datos del cliente");
        setSelectedClientData(null);
      }
    } catch {
      setError("Error al cargar los datos del cliente");
      setSelectedClientData(null);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!clientId) {
      errors.client = "Debes seleccionar un cliente";
    }

    if (title.length < MIN_TITLE_LENGTH) {
      errors.title = `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres`;
    } else if (title.length > MAX_TITLE_LENGTH) {
      errors.title = `El título no puede exceder ${MAX_TITLE_LENGTH} caracteres`;
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      errors.description = "La descripción es requerida";
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `La descripción no puede exceder ${MAX_DESCRIPTION_LENGTH} caracteres`;
    }

    if (!videoFile) {
      errors.video = "Debes seleccionar un archivo de video";
    } else if (videoFile.size > MAX_VIDEO_SIZE) {
      errors.video = `El video no puede exceder ${
        MAX_VIDEO_SIZE / (1024 * 1024)
      }MB`;
    } else if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
      errors.video = "Formato de video no válido. Usa MP4, MOV o AVI";
    }

    if (!scheduledDate || !scheduledTime) {
      errors.date = "Debes seleccionar fecha y hora de publicación";
    } else {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      if (scheduledDateTime <= now) {
        errors.date = "La fecha de publicación debe ser futura";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  function toLocalISO(date: string, time: string) {
    const [hours, minutes] = time.split(":").map(Number);

    const localDate = new Date();
    localDate.setFullYear(Number(date.split("-")[0]));
    localDate.setMonth(Number(date.split("-")[1]) - 1);
    localDate.setDate(Number(date.split("-")[2]));
    localDate.setHours(hours);
    localDate.setMinutes(minutes);
    localDate.setSeconds(0);
    localDate.setMilliseconds(0);

    const tzOffset = -localDate.getTimezoneOffset(); 
    const sign = tzOffset >= 0 ? "+" : "-";
    const diffHours = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(
      2,
      "0"
    );
    const diffMinutes = String(Math.abs(tzOffset) % 60).padStart(2, "0");
    const offset = `${sign}${diffHours}:${diffMinutes}`;

    const isoLocal = `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(
      2,
      "0"
    )}T${String(localDate.getHours()).padStart(2, "0")}:${String(
      localDate.getMinutes()
    ).padStart(2, "0")}:00${offset}`;

    return isoLocal;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Por favor corrige los errores en el formulario");
      return;
    }

    if (!videoFile) {
      setError("Por favor selecciona un archivo de video");
      return;
    }

    if (!selectedClientData) {
      setError("No se pudieron cargar los datos del cliente");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadProgress("Creando contenedor de media en Instagram...");

    try {
      const containerResponse = await metaApi.createMediaContainer(
        selectedClientData.insta_id,
        {
          media_type: "REELS",
          caption: description,
          access_token: selectedClientData.long_lived_token,
          upload_type: "resumable",
        }
      );

      if (!containerResponse.id) {
        throw new Error("No se pudo crear el contenedor de media");
      }

      const containerMediaId = containerResponse.id;
      setUploadProgress("Enviando datos al servidor...");

      const formData = new FormData();
      formData.append("client_id", clientId);
      formData.append("title", title);
      formData.append("description", description);

      const scheduledDateTime = toLocalISO(scheduledDate, scheduledTime);
      formData.append("scheduled_date", scheduledDateTime);

      formData.append("container_media_id", containerMediaId);

      formData.append("reel", videoFile);

      setUploadProgress("Procesando reel en el servidor...");

      const response = await appPublications.scheduleReel(formData);
      if (!response) {
        throw new Error("Error al programar el reel");
      }

      setSuccess(true);
      setClientId("");
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setScheduledDate("");
      setScheduledTime("");
      setSelectedClientData(null);
      setValidationErrors({});
      setUploadProgress("");

      setTimeout(() => {
        setCurrentPage("publications");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al programar el reel. Por favor intenta de nuevo."
      );
      setUploadProgress("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const errors: typeof validationErrors = { ...validationErrors };

    if (!file.type.startsWith("video/")) {
      errors.video = "Por favor selecciona un archivo de video válido";
      setValidationErrors(errors);
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      errors.video = `El video no puede exceder ${
        MAX_VIDEO_SIZE / (1024 * 1024)
      }MB`;
      setValidationErrors(errors);
      return;
    }

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      errors.video = "Formato no soportado. Usa MP4, MOV o AVI";
      setValidationErrors(errors);
      return;
    }

    delete errors.video;
    setValidationErrors(errors);
    setVideoFile(file);
  };

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

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-5 h-5" />}>
          ¡Reel programado exitosamente! Redirigiendo...
        </Alert>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Programar Reel
        </h1>
        <p className="text-muted-foreground">
          Crea y programa una nueva publicación de Instagram Reel
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Detalles de la Publicación</h2>
          <p className="text-sm text-muted-foreground">
            Completa la información del reel que deseas programar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {clients.length === 0 ? (
              <div className="p-4 border border-border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  No tienes clientes registrados. Por favor, agrega un cliente
                  primero.
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
              <div className="space-y-2">
                <Select
                  id="client"
                  label="Cliente"
                  value={clientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  required
                  error={validationErrors.client}
                  disabled={isLoadingClient}
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id.toString()}>
                      {client.name} (@{client.username})
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
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900">
                      ✓ Cliente cargado: {selectedClientData.name} (@
                      {selectedClientData.username})
                    </p>
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
                setTitle(e.target.value);
                setValidationErrors({ ...validationErrors, title: undefined });
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
                setDescription(e.target.value);
                setValidationErrors({
                  ...validationErrors,
                  description: undefined,
                });
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
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-input-background hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="video"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="text-muted-foreground mb-2">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-center">
                    {videoFile ? (
                      <>
                        <span className="font-medium text-foreground">
                          {videoFile.name}
                        </span>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </>
                    ) : (
                      "Haz clic para seleccionar un video"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, AVI (máx. 100MB)
                  </p>
                </label>
              </div>
              {validationErrors.video && (
                <p className="text-sm text-destructive">
                  {validationErrors.video}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="date"
                id="date"
                label="Fecha de Publicación"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value);
                  setValidationErrors({ ...validationErrors, date: undefined });
                }}
                required
                min={getMinDate()}
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
                  setScheduledTime(e.target.value);
                  setValidationErrors({ ...validationErrors, date: undefined });
                }}
                required
                leftIcon={<Clock className="w-4 h-4" />}
                disabled={isLoading}
              />
            </div>

            {isLoading && uploadProgress && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-900">{uploadProgress}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setCurrentPage("dashboard")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                fullWidth
                disabled={clients.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
  );
}
