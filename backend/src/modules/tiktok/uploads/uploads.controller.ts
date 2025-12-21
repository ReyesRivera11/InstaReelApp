import { Request, Response } from "express";
import { HttpCode } from "../../../shared/enums/HttpCode";

export const uploadVideo = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(HttpCode.BAD_REQUEST).json({
      success: false,
      error: "No se envió ningún archivo",
    });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const videoUrl = `${baseUrl}/uploads/${req.file.filename}`;

  return res.status(HttpCode.CREATED).json({
    success: true,
    video_url: videoUrl,
    filename: req.file.filename,
  });
};
