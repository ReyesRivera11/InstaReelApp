import { Router } from "express";
import { XAuthController } from "../controllers/xAuth.controller";
import { XPostController } from "../controllers/xPost.controller";
import multer from "multer";
import { XPublicationsController } from "../controllers/xPublications.controller"

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

/**🔐 Iniciar OAuth de X */
router.post("/auth", XAuthController.auth);

/**🔁 Callback OAuth de X */
router.get("/callback", XAuthController.callback);

/** 🐦 Publicar en X */
router.post(
  "/posts",
  upload.single("media"),
  XPostController.create
)

/** 📄 Listar publicaciones en X */
router.get("/", XPublicationsController.list)
/** 📄 Detalle de una publicación en X */
router.get("/:id", XPublicationsController.detail)

export default router;
