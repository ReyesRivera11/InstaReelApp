import { useState } from "react";
import type { Client } from "../../../core/types";
import {
  Button,
  Input,
  Modal,
  Card,
  CardHeader,
  CardContent,
  Badge,
  Alert,
} from "../../../shared/components/ui";
import { Icons } from "../../../shared/components/icons";

interface ClientsPageProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, "id" | "createdAt">) => void;
  onDeleteClient: (id: string) => void;
}

export function ClientsPage({
  clients,
  onAddClient,
  onDeleteClient,
}: ClientsPageProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "auth">("info");
  const [name, setName] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [description, setDescription] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("auth");
  };

  const handleInstagramAuth = () => {
    const appId = "YOUR_META_APP_ID";
    const redirectUri = "YOUR_REDIRECT_URI";
    const scope =
      "pages_show_list,instagram_basic,instagram_content_publish,business_management";

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    window.open(authUrl, "_blank", "width=600,height=700");
    setIsAuthenticating(true);
  };

  const handleCompleteAuth = () => {
    onAddClient({
      name,
      instagramHandle,
      description,
      isAuthenticated: true,
      accessToken: "mock_access_token_" + Date.now(),
      pageId: "mock_page_id",
      instagramId: "mock_instagram_id",
    });

    setName("");
    setInstagramHandle("");
    setDescription("");
    setAuthCode("");
    setStep("info");
    setIsAuthenticating(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setName("");
    setInstagramHandle("");
    setDescription("");
    setAuthCode("");
    setStep("info");
    setIsAuthenticating(false);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Mis Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona las cuentas de Instagram de tus clientes
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icons.Plus />
          Agregar Cliente
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={handleCancel}
        title={step === "info" ? "Nuevo Cliente" : "Conectar con Instagram"}
        description={
          step === "info"
            ? "Registra una nueva cuenta de Instagram para gestionar"
            : "Autoriza el acceso a la cuenta de Instagram del cliente"
        }
        maxWidth="2xl"
      >
        {step === "info" ? (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
            <Alert variant="info" icon={<Icons.AlertCircle />}>
              Después de ingresar la información básica, deberás autenticar la
              cuenta de Instagram con OAuth
            </Alert>

            <Input
              id="name"
              label="Nombre del Cliente"
              placeholder="Nombre de la empresa o marca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="handle"
              label="Usuario de Instagram"
              placeholder="usuario_instagram"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              required
              leftIcon={<span className="text-muted-foreground">@</span>}
            />

            <Input
              id="description"
              label="Descripción (opcional)"
              placeholder="Breve descripción del cliente"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                  <Icons.Instagram />
                </div>
                <div>
                  <p>{name}</p>
                  <p className="text-sm text-muted-foreground">
                    @{instagramHandle}
                  </p>
                </div>
              </div>
            </div>

            <Alert variant="info" icon={<Icons.AlertCircle />}>
              <strong>Flujo de autenticación OAuth:</strong>
              <br />
              El cliente debe otorgar permisos a tu aplicación para publicar en
              su cuenta de Instagram.
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm">Paso 1: Autorización de Instagram</h4>
                <p className="text-sm text-muted-foreground">
                  Haz clic en el botón para abrir la ventana de autenticación de
                  Instagram/Facebook OAuth.
                </p>
                <Button type="button" onClick={handleInstagramAuth} fullWidth>
                  <Icons.Instagram />
                  Conectar cuenta de Instagram
                  <Icons.ExternalLink />
                </Button>
              </div>

              {isAuthenticating && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm">Paso 2: Código de Autorización</h4>
                    <p className="text-sm text-muted-foreground">
                      Después de autorizar, Instagram te redirigirá con un
                      código. Pégalo aquí:
                    </p>
                    <Input
                      placeholder="Código de autorización"
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">
                      API Endpoint para intercambiar código:
                    </p>
                    <code className="text-xs block p-2 bg-background rounded border overflow-x-auto">
                      GET https://graph.facebook.com/v19.0/oauth/access_token
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Permisos requeridos:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="default">pages_show_list</Badge>
                      <Badge variant="default">instagram_basic</Badge>
                      <Badge variant="default">instagram_content_publish</Badge>
                      <Badge variant="default">business_management</Badge>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCompleteAuth}
                disabled={!isAuthenticating || !authCode}
              >
                <Icons.CheckCircle />
                Completar Autenticación
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground mb-4">
                <Icons.Instagram />
              </div>
              <p className="text-muted-foreground text-center mb-4">
                No tienes clientes registrados aún
              </p>
              <Button onClick={() => setOpen(true)} variant="outline">
                <Icons.Plus />
                Agregar tu primer cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} hover>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                      <Icons.Instagram />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="truncate">{client.name}</h3>
                        {client.isAuthenticated && (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1 flex-shrink-0"
                          >
                            <Icons.CheckCircle />
                            Conectado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{client.instagramHandle}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClient(client.id)}
                    className="text-destructive hover:text-destructive flex-shrink-0 p-2"
                  >
                    <Icons.Trash />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.description && (
                  <p className="text-sm text-muted-foreground">
                    {client.description}
                  </p>
                )}
                {client.isAuthenticated && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Credenciales conectadas:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        Access Token: {client.accessToken?.substring(0, 20)}...
                      </code>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
