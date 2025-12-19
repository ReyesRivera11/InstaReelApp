import { Router } from "express";
import { XAuthController } from "../controllers/xAuth.controller";
import { XPostController } from "../controllers/xPost.controller";

const router = Router();

// OAuth
router.get("/auth/:clientId", XAuthController.auth);
router.get("/callback", XAuthController.callback);

// Tweets
router.post("/post/:clientId", XPostController.post);

export default router;
