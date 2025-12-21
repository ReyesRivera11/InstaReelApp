import { Router } from "express";
import { XAuthController } from "../controllers/xAuth.controller";
import { XPostController } from "../controllers/xPost.controller";
import multer from "multer";

// import { authMiddleware } from "../../auth/middlewares/auth.middleware";

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "../uploads");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

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
  upload.single("media"),
  XPostController.create
)


export default router;
