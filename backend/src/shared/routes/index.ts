import { Router } from "express";

import authRouter from "../../modules/auth/routes/auth.routes";
import clientRouter from "../../modules/client/routes/clients.routes";
import publicationRouter from "../../modules/publication/routes/publication.routes";
import dashboardRouter from "../../modules/dashboard/routes/dashboard.routes";

const router = Router();

router.use('/auth', authRouter);
router.use('/client', clientRouter);
router.use('/publication', publicationRouter);
router.use('/dashboard', dashboardRouter);

export default router;