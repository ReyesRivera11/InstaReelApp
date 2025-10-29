import { Router } from "express";

import authRouter from "../../modules/auth/routes/auth.routes";
import clientRouter from "../../modules/client/routes/clients.routes";
import reelsRouter from "../../modules/reels/routes/reels.routes";
import dashboardRouter from "../../modules/dashboard/routes/dashboard.routes";
import metaRouter from "../../modules/meta/routes/meta.routes";

const router = Router();

router.use('/auth', authRouter);
router.use('/client', clientRouter);
router.use('/reels', reelsRouter);
router.use('/meta/webhook', metaRouter);
router.use('/dashboard', dashboardRouter);

export default router;