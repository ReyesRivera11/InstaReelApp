import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { AppError } from "../../core/errors/AppError";
import { HttpCode } from "../enums/HttpCode";

/* ================================
   Directorio uploads
================================ */
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================================
   Filtro de video TikTok
================================ */
const videoFileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-m4v",
    "video/x-msvideo",
  ];

  const allowedExtensions = [".mp4", ".mov", ".m4v", ".avi"];

  const fileExtension = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: `Formato no permitido. Solo se aceptan: ${allowedExtensions.join(
          ", "
        )}`,
      })
    );
  }
};

/* ================================
   Multer TikTok (DISK)
================================ */
const tiktokVideoUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export default tiktokVideoUpload;
