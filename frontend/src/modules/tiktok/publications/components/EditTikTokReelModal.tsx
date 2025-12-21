"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Textarea } from "../../../../shared/components/ui";
import { apiTikTokReels } from "../../../../shared/services/api/tiktok/apiTikTokReels";

/* ================================
   Tipos
================================ */
interface TikTokReel {
  id: number;
  title: string;
  description?: string;
  video_url?: string;
  scheduled_at?: string; // UTC
  status: string;
}

/* ================================
   Props
================================ */
interface EditTikTokReelModalProps {
  reel: TikTokReel | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

/* ================================
   Helpers
================================ */
const buildScheduledAtUTC = (date: string, time: string) => {
  const localDate = new Date(`${date}T${time}:00`);
  return localDate.toISOString(); // ✅ UTC real
};

const dateToLocalInputs = (utc?: string) => {
  if (!utc) return { date: "", time: "" };

  const d = new Date(utc);

  const date = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }); // HH:mm

  return { date, time };
};

/* ================================
   Modal
================================ */
export function EditTikTokReelModal({
  reel,
  isOpen,
  onClose,
  onUpdated,
}: EditTikTokReelModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================================
     Cargar datos (UTC → LOCAL)
  ================================ */
  useEffect(() => {
    if (!reel) return;

    setTitle(reel.title);
    setDescription(reel.description || "");

    const { date, time } = dateToLocalInputs(reel.scheduled_at);
    setDate(date);
    setTime(time);
  }, [reel]);

  if (!isOpen || !reel) return null;

  /* ================================
     Guardar cambios (LOCAL → UTC)
  ================================ */
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload: {
        title: string;
        description?: string;
        scheduled_at?: string;
      } = {
        title,
        description,
      };

      if (date && time) {
        payload.scheduled_at = buildScheduledAtUTC(date, time);
      }

      await apiTikTokReels.updateReel(reel.id, payload);

      onUpdated();
      onClose();
    } catch {
      setError("No se pudo actualizar el reel");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     Render
  ================================ */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Editar Reel de TikTok</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {reel.video_url && (
            <div className="aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden bg-black shadow">
              <video
                src={reel.video_url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Descripción"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Fecha"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="time"
              label="Hora"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="gradient"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
