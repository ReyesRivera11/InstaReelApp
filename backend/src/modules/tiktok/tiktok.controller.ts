import { Request, Response } from "express";
import axios from "axios";
import prisma from "../../shared/lib/prisma";
import { Prisma } from "@prisma/client";


const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

/**
 * Almacenamiento temporal por state (NO cookies)
 * En producción puede migrarse a BD
 */
const pendingTikTokClients = new Map<
  string,
  { name: string; username: string; description?: string }
>();

/* ================================
   PASO 0 – PREPARE
================================ */
export const prepareTikTokClient = (req: Request, res: Response) => {
  const { name, username, description } = req.body;

  if (!name || !username) {
    return res.status(400).json({ success: false });
  }

  const state = Math.random().toString(36).substring(2);

  pendingTikTokClients.set(state, {
    name,
    username,
    description,
  });

  return res.json({
    success: true,
    state,
  });
};

/* ================================
   PASO 1 – INICIAR OAUTH
================================ */
export const startTikTokAuth = (req: Request, res: Response) => {
  const { state } = req.query;

  if (!state || typeof state !== "string") {
    return res.status(400).send("Missing state");
  }

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    response_type: "code",
    scope: "user.info.basic,video.publish",
    redirect_uri: REDIRECT_URI,
    state,
    disable_auto_auth: "1",
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
  return res.redirect(authUrl);
};

/* ================================
   PASO 2 – CALLBACKdasasadadadada
================================ */
export const tiktokCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state || typeof state !== "string") {
      return res.redirect(`${FRONTEND_URL}/tiktok/clients?tiktok=error`);
    }

    const pendingClient = pendingTikTokClients.get(state);

    if (!pendingClient) {
      return res.redirect(`${FRONTEND_URL}/tiktok/clients?tiktok=error2`);
    }

    pendingTikTokClients.delete(state);

    /* ================================
       Exchange Code → Token
    ================================ */
    const tokenResponse = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const {
      access_token,
      refresh_token,
      expires_in,
      open_id,
    } = tokenResponse.data;

    /* ================================
       Crear CLIENT
    ================================ */
    const client = await prisma.client.create({
      data: {
        name: pendingClient.name,
        username: pendingClient.username,
        description: pendingClient.description,
        social_identity: "TIKTOK",
      },
    });

    /* ================================
       Guardar cuenta TikTok
    ================================ */
    await prisma.tiktok_account.create({
      data: {
        client_id: client.id,
        open_id,
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000),
      },
    });

    return res.redirect(
      `${FRONTEND_URL}/tiktok/clients?tiktok=success1`
    );
  } catch (error) {
    console.error("❌ TikTok Callback Error:", error);
    return res.redirect(`${FRONTEND_URL}/tiktok/clients?tiktok=error3`);
  }
};

export const listTikTokClients = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = String(req.query.search ?? "");

    const skip = (page - 1) * limit;

    const where: Prisma.clientWhereInput = {
      social_identity: "TIKTOK",
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          username: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
      }),
      prisma.client.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        clients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error listando clientes TikTok:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener clientes de TikTok",
    });
  }
};

export const updateTikTokClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);
    const { name, username, description } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "ID inválido",
      });
    }

    const existing = await prisma.client.findFirst({
      where: {
        id: clientId,
        social_identity: "TIKTOK",
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: "Cliente TikTok no encontrado",
      });
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(description !== undefined && { description }),
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error actualizando cliente TikTok:", error);
    return res.status(500).json({
      success: false,
      error: "Error al actualizar cliente TikTok",
    });
  }
};

export const deleteTikTokClient = async (req: Request, res: Response) => {
  try {
    const clientId = Number(req.params.id);

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "ID inválido",
      });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        social_identity: "TIKTOK",
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: "Cliente TikTok no encontrado",
      });
    }

    // 1️⃣ borrar cuenta TikTok
    await prisma.tiktok_account.deleteMany({
      where: {
        client_id: clientId,
      },
    });

    // 2️⃣ borrar cliente
    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cliente TikTok eliminado correctamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando cliente TikTok:", error);
    return res.status(500).json({
      success: false,
      error: "Error al eliminar cliente TikTok",
    });
  }
};
