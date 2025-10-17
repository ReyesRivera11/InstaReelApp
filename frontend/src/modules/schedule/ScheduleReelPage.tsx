import { useState } from "react";
import {
  Button,
  Input,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardContent,
} from "../../shared/components/ui";
import { Icons } from "../../shared/components/icons";
import { useApp } from "../../shared/hooks/useApp";

export function ScheduleReelPage() {
  const { clients, addPublication, setCurrentPage } = useApp();
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      alert("Por favor selecciona un archivo de video");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

    addPublication({
      clientId,
      title,
      description,
      videoUrl: URL.createObjectURL(videoFile),
      scheduledDate: scheduledDateTime.toISOString(),
    });

    setClientId("");
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setScheduledDate("");
    setScheduledTime("");

    setCurrentPage("publications");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      alert("Por favor selecciona un archivo de video válido");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1>Programar Reel</h1>
        <p className="text-muted-foreground">
          Crea y programa una nueva publicación de Instagram Reel
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2>Detalles de la Publicación</h2>
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
              <Select
                id="client"
                label="Cliente"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} (@{client.instagramHandle})
                  </option>
                ))}
              </Select>
            )}

            <Input
              id="title"
              label="Título del Reel"
              placeholder="Ingresa un título descriptivo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              id="description"
              label="Descripción / Caption"
              placeholder="Escribe la descripción que se publicará con el reel..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              helperText="Incluye hashtags y menciones si es necesario"
            />

            <div className="space-y-2">
              <label htmlFor="video">Archivo de Video</label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 bg-input-background hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="video"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="text-muted-foreground mb-2">
                    <Icons.Upload />
                  </div>
                  <p className="text-sm">
                    {videoFile
                      ? videoFile.name
                      : "Haz clic para seleccionar un video"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MOV, AVI (máx. 100MB)
                  </p>
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="date"
                id="date"
                label="Fecha de Publicación"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                leftIcon={<Icons.Calendar />}
              />

              <Input
                type="time"
                id="time"
                label="Hora de Publicación"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                leftIcon={<Icons.Clock />}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setCurrentPage("dashboard")}
              >
                Cancelar
              </Button>
              <Button type="submit" fullWidth disabled={clients.length === 0}>
                Programar Reel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
