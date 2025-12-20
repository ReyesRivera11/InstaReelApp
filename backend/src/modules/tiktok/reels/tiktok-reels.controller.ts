import { Request, Response } from "express";
import { TikTokReelsService } from "./tiktok-reels.service";
import { TikTokReelStatus } from "@prisma/client";

export const createTikTokReel = async (req: Request, res: Response) => {
  try {
    const reel = await TikTokReelsService.createReel(req.body);
    return res.status(201).json({ success: true, data: reel });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const listTikTokReels = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = String(req.query.search ?? "");

    let status: TikTokReelStatus | undefined;

    if (
      typeof req.query.status === "string" &&
      Object.values(TikTokReelStatus).includes(
        req.query.status as TikTokReelStatus
      )
    ) {
      status = req.query.status as TikTokReelStatus;
    }

    const client_id = req.query.client_id
      ? Number(req.query.client_id)
      : undefined;

    const result = await TikTokReelsService.list({
      page,
      limit,
      search,
      status,
      client_id,
    });

    return res.json({
      success: true,
      data: {
        reels: result.reels,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error listando reels TikTok:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener reels de TikTok",
    });
  }
};

/* ================================
   ✏️ EDITAR REEL
================================ */
export const updateTikTokReel = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, description, scheduled_at } = req.body;

    const reel = await TikTokReelsService.updateReel(id, {
      title,
      description,
      scheduled_at,
    });

    return res.json({ success: true, data: reel });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/* ================================
   🗑️ ELIMINAR REEL
================================ */
export const deleteTikTokReel = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await TikTokReelsService.deleteReel(id);

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
