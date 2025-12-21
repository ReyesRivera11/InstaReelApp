import { Router } from "express";
import { TikTokCreatorInfoController } from "./creator-info.controller";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware"; 
// ajusta el path si tu middleware está en otro lugar

const router = Router();

router.post(
  "/creator_info",
  authMiddleware,
  TikTokCreatorInfoController.getCreatorInfo
);

export default router;
