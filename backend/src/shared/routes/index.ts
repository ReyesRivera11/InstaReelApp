import { Router } from "express";

import authRouter from "../../modules/auth/routes/auth.routes";
import clientRouter from "../../modules/client/routes/clients.routes";

const router = Router();

router.use('/auth', authRouter);
router.use('/client', clientRouter);

export default router;