import { Router } from "express";

import tiktokAuthRoutes from "./auth/tiktok-auth.routes";
import tiktokReelsRoutes from "./reels/tiktok-reels.routes";
import uploadsRoutes from "./uploads/uploads.routes";
import creatorInfoRoutes from "./creatorInfo/creator-info.routes";

const router = Router();

// OAuth + Clients
router.use("/", tiktokAuthRoutes);

router.use("/", creatorInfoRoutes);

// Reels (programación / estado)
router.use("/reels", tiktokReelsRoutes);

router.use("/uploads", uploadsRoutes);

export default router;
