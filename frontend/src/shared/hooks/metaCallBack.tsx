import { useEffect } from "react";
import type { CreateClientDTO } from "../../core/types";
import { apiClient } from "../services/api/instagram/apiClients";

export function MetaCallbackPage() {
  useEffect(() => {
    const processAuth = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in") || "";
      const longLivedToken = params.get("long_lived_token") || "";

      if (!accessToken) {
        window.opener?.postMessage(
          {
            type: "INSTAGRAM_OAUTH_ERROR",
            error: "No se recibió token de acceso",
          },
          window.location.origin
        );
        window.close();
        return;
      }

      const clientDataString = localStorage.getItem("pending_client");
      const clientData = clientDataString ? JSON.parse(clientDataString) : null;

      const payload: CreateClientDTO = {
        name: clientData?.name || "",
        username: clientData?.username || "",
        description: clientData?.description || "",
        access_token: accessToken,
        expires_in: expiresIn,
        long_lived_token: longLivedToken,
      };
      try {
        const result = await apiClient.createClient(payload);

        if (result) {
          window.opener?.postMessage(
            { type: "INSTAGRAM_OAUTH_SUCCESS" },
            window.location.origin
          );
        } else {
          window.opener?.postMessage(
            {
              type: "INSTAGRAM_OAUTH_ERROR",
              error: "Error desconocido",
            },
            window.location.origin
          );
        }
      } catch (error) {
        window.opener?.postMessage(
          {
            type: "INSTAGRAM_OAUTH_ERROR",
            error: error instanceof Error ? error.message : "Error desconocido",
          },
          window.location.origin
        );
      } finally {
        localStorage.removeItem("pending_client");
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    };

    processAuth();
  }, []);

  return <div>Procesando autenticación con Meta...</div>;
}
