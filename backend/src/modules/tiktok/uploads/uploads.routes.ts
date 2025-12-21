import { Router } from "express";
import { uploadVideo } from "./uploads.controller";
import tiktokVideoUpload from "../../../shared/config/multer_tiktok";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";

const router = Router();

// POST /api/tiktok/uploads/video
router.post(
  "/video",
  authMiddleware,
  tiktokVideoUpload.single("reel"),
  uploadVideo
);

export default router;
