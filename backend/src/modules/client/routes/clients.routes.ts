import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.post('/create', ClientController.createClient)

export default clientRouter;