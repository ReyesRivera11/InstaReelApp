import { Request, Response } from "express";
import { TikTokCreatorInfoService } from "./creator-info.service";

export class TikTokCreatorInfoController {
  static async getCreatorInfo(req: Request, res: Response) {
    try {
      const { client_id } = req.body;

      if (!client_id) {
        return res.status(400).json({
          success: false,
          message: "client_id es obligatorio",
        });
      }

      const info =
        await TikTokCreatorInfoService.getCreatorInfo(Number(client_id));

      return res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message:
          error?.message || "Error al obtener información del creador",
      });
    }
  }
}
