import { Router } from "express";
import { MetaWebhookController } from "../controller/metaWebhook.controller";

const metaRouter = Router();

metaRouter.get('/', MetaWebhookController.verifyWebhook);
metaRouter.post('/', MetaWebhookController.handleWebhook);

export default metaRouter;