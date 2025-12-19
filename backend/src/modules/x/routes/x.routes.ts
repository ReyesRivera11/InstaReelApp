import { Router } from "express";
import { XAuthController } from "../controllers/xAuth.controller";
import { XPostController } from "../controllers/xPost.controller";
// import { authMiddleware } from "../../auth/middlewares/auth.middleware";

const router = Router();

/**
 * 🔐 Iniciar OAuth de X
 * Crea client nuevo (social_identity = X)
 */
router.post("/auth", XAuthController.auth);

/**
 * 🔁 Callback OAuth de X
 */
router.get("/callback", XAuthController.callback);

/**
 * 🐦 Publicar en X
 * Requiere cuenta X vinculada
 */
router.post(
  "/posts",
  // authMiddleware,
  XPostController.post
);

export default router;
