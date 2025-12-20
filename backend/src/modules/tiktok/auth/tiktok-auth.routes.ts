import { Router } from "express";
import {
  prepareTikTokClient,
  startTikTokAuth,
  tiktokCallback,
  listTikTokClients,
  updateTikTokClient,
  deleteTikTokClient,
} from "./tiktok-auth.controller";

import { authMiddleware } from "../../../shared/middlewares/authMiddleware";

const router = Router();

// OAuth
router.post("/prepare", prepareTikTokClient);
router.get("/auth", startTikTokAuth);
router.get("/callback", tiktokCallback);

// CRUD TikTok
router.get("/clients", authMiddleware, listTikTokClients);
router.patch("/clients/:id", authMiddleware, updateTikTokClient);
router.delete("/clients/:id", authMiddleware, deleteTikTokClient);

export default router;
