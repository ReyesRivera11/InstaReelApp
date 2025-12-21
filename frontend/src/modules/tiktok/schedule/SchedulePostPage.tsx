"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Select,
} from "../../../shared/components/ui";
import { useApp } from "../../../shared/hooks/useApp";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Clock,
  Calendar,
  Upload,
} from "lucide-react";

import type { ClientDB } from "../../../core/types";
import { apiTikTokClients } from "../../../shared/services/api/tiktok/apiTikTokClients";
import { apiTikTokReels } from "../../../shared/services/api/tiktok/apiTikTokReels";
import { apiTikTokUploads } from "../../../shared/services/api/tiktok/apiTikTokUploads";

/* ================================
   Constantes TikTok
================================ */
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2200;

/* ================================
   Tipos
================================ */
interface CreatorInfo {
  creator_username: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
}

/* ================================
   Página
================================ */
export default function ScheduleTikTokReelPage() {
  const { setCurrentPage } = useApp();

  const [clients, setClients] = useState<ClientDB[]>([]);
  const [clientId, setClientId] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientDB | null>(null);

  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [privacyLevel, setPrivacyLevel] = useState("");
  const [allowComment, setAllowComment] = useState(false);
  const [allowDuet, setAllowDuet] = useState(false);
  const [allowStitch, setAllowStitch] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [isCommercial, setIsCommercial] = useState(false);
  const [brandSelf, setBrandSelf] = useState(false);
  const [brandThirdParty, setBrandThirdParty] = useState(false);

  const [consentChecked, setConsentChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* ================================
     Cargar clientes TikTok
  ================================ */
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await apiTikTokClients.getClients({
          page: 1,
          limit: 100,
        });
        setClients(res.clients);
      } catch {
        setError("Error al cargar clientes de TikTok");
      }
    };
    loadClients();
  }, []);

  /* ================================
     Seleccionar cliente + creator info
  ================================ */
  const handleClientChange = async (id: string) => {
    setClientId(id);
    setCreatorInfo(null);
    setPrivacyLevel("");

    const client = clients.find((c) => c.id === Number(id)) || null;
    setSelectedClient(client);

    if (!client) return;

    try {
      const res = await apiTikTokReels.getCreatorInfo({
        client_id: client.id,
      });

      const info = res.data;

      setCreatorInfo({
        creator_username: info.creator_username,
        privacy_level_options: Array.isArray(info.privacy_level_options)
          ? info.privacy_level_options
          : [],
        comment_disabled: !!info.comment_disabled,
        duet_disabled: !!info.duet_disabled,
        stitch_disabled: !!info.stitch_disabled,
      });

      setAllowComment(false);
      setAllowDuet(false);
      setAllowStitch(false);
    } catch {
      setError("No se pudo obtener la información del creador");
    }
  };

  /* ================================
     Manejo del video (nuevo)
  ================================ */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_VIDEO_SIZE) {
        setError("El video no puede pesar más de 100MB");
        return;
      }
      if (!file.type.startsWith("video/")) {
        setError("Solo se permiten archivos de video");
        return;
      }
      setVideoFile(file);
      setError(null);
    }
  };

  /* ================================
     Validaciones TikTok (Sandbox)
  ================================ */
  const validateForm = (): boolean => {
    if (!selectedClient) {
      setError("Debes seleccionar una cuenta TikTok");
      return false;
    }

    if (!creatorInfo) {
      setError("No se pudo validar la cuenta del creador");
      return false;
    }

    if (!title || title.length > MAX_TITLE_LENGTH) {
      setError("El título es obligatorio (máx. 100 caracteres)");
      return false;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError("La descripción excede el límite permitido");
      return false;
    }

    if (!videoFile) {
      setError("Debes seleccionar un video");
      return false;
    }

    if (videoFile.size > MAX_VIDEO_SIZE) {
      setError("El video excede 100MB");
      return false;
    }

    if (!privacyLevel) {
      setError("Debes seleccionar la privacidad");
      return false;
    }

    if (privacyLevel !== "SELF_ONLY") {
      setError(
        "En modo Sandbox, TikTok solo permite publicaciones privadas (Solo yo)"
      );
      return false;
    }

    if (isCommercial && !brandSelf && !brandThirdParty) {
      setError(
        "Debes indicar si el contenido promociona tu marca, una marca de terceros o ambas"
      );
      return false;
    }

    if (!consentChecked) {
      setError("Debes aceptar la confirmación requerida por TikTok");
      return false;
    }

    return true;
  };

  /* ================================
     Submit
  ================================ */
  const buildScheduledAtUTC = (date: string, time: string) => {
    const localDate = new Date(`${date}T${time}:00`);
    return localDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm() || !videoFile || !selectedClient) return;

    setIsLoading(true);

    try {
      setUploadProgress("Subiendo video...");

      const uploadRes = await apiTikTokUploads.uploadVideo(videoFile);

      if (!uploadRes.success || !uploadRes.video_url) {
        throw new Error("Error al subir el video");
      }

      setUploadProgress("Publicando en TikTok...");

      await apiTikTokReels.scheduleReel({
        client_id: selectedClient.id,
        title,
        description,
        video_url: uploadRes.video_url,
        privacy_level: privacyLevel,
        allow_comment: allowComment,
        allow_duet: allowDuet,
        allow_stitch: allowStitch,
        is_commercial: isCommercial,
        brand_self: brandSelf,
        brand_third_party: brandThirdParty,
        scheduled_at: buildScheduledAtUTC(scheduledDate, scheduledTime),
      });

      setSuccess(true);
      setUploadProgress("");

      setTimeout(() => setCurrentPage("tiktok-publications"), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al publicar en TikTok"
      );
      setUploadProgress("");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================================
     Render
  ================================ */
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && (
        <Alert variant="error" icon={<AlertCircle />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle />}>
          ¡Video enviado correctamente a TikTok!
        </Alert>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Programar Reel de TikTok
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
            <Select
              label="Cuenta TikTok"
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="">Selecciona una cuenta</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            {creatorInfo && (
              <p className="text-sm text-muted-foreground">
                Publicando como{" "}
                <strong className="text-foreground">
                  @{creatorInfo.creator_username}
                </strong>
              </p>
            )}

            <Input
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              placeholder="Ingresa un título descriptivo"
            />

            {/* ============= DESCRIPCIÓN + CONTADOR (EXACTO COMO EN LA IMAGEN) ============= */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción / Caption
              </label>

              <Textarea
                placeholder="Escribe la descripción que se publicará con el reel..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className="resize-none"
              />

              {/* Contador fuera del textarea, a la izquierda y en gris claro */}
              <div className="text-xs text-gray-500">
                {description.length}/{MAX_DESCRIPTION_LENGTH} caracteres
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Archivo de Video
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  id="video-upload"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="video-upload"
                  className="flex flex-col items-center py-10 cursor-pointer"
                >
                  {/* Ícono siempre visible */}
                  <Upload className="w-10 h-10 text-gray-400 mb-3" />

                  <p className="text-sm text-center px-8">
                    {videoFile ? (
                      <>
                        <span className="font-medium text-gray-900 block">
                          {videoFile.name}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-600">
                        Haz clic para seleccionar un video
                      </span>
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    MP4, MOV, AVI (máx. 100MB)
                  </p>
                </label>
              </div>
            </div>
            {creatorInfo && creatorInfo.privacy_level_options.length > 0 && (
              <Select
                label="Privacidad"
                value={privacyLevel}
                onChange={(e) => setPrivacyLevel(e.target.value)}
              >
                <option value="">Selecciona privacidad</option>
                {creatorInfo.privacy_level_options.map((p) => (
                  <option key={p} value={p}>
                    {p === "SELF_ONLY" && "Solo yo (privado)"}
                    {p === "PUBLIC_TO_EVERYONE" && "Público"}
                    {p === "MUTUAL_FOLLOW_FRIENDS" && "Amigos"}
                  </option>
                ))}
              </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Fecha"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                type="time"
                label="Hora"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                leftIcon={<Clock className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={isCommercial}
                  onChange={(e) => {
                    setIsCommercial(e.target.checked);
                    if (!e.target.checked) {
                      setBrandSelf(false);
                      setBrandThirdParty(false);
                    }
                  }}
                />
                Contenido comercial
              </label>

              {isCommercial && (
                <div className="ml-6 space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brandSelf}
                      onChange={(e) => setBrandSelf(e.target.checked)}
                    />
                    Promociona mi propia marca
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={brandThirdParty}
                      onChange={(e) => setBrandThirdParty(e.target.checked)}
                    />
                    Promociona una marca de terceros
                  </label>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              {isCommercial && brandThirdParty ? (
                <>
                  Al publicar, aceptas la{" "}
                  <strong>Política de Contenido de Marca</strong> y la{" "}
                  <strong>Confirmación de uso de música de TikTok</strong>.
                </>
              ) : (
                <>
                  Al publicar, aceptas la{" "}
                  <strong>Confirmación de uso de música de TikTok</strong>.
                </>
              )}
            </label>

            {isLoading && uploadProgress && (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="animate-spin w-4 h-4" />
                {uploadProgress}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentPage("dashboard")}
                disabled={isLoading}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar en TikTok"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
