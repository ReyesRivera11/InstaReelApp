import { Router } from "express";
import {
  createTikTokReel,
  listTikTokReels,
  updateTikTokReel,
  deleteTikTokReel,
} from "./tiktok-reels.controller";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createTikTokReel);
router.get("/", authMiddleware, listTikTokReels);

// ✏️ editar
router.put("/:id", authMiddleware, updateTikTokReel);

// 🗑️ eliminar
router.delete("/:id", authMiddleware, deleteTikTokReel);

export default router;
