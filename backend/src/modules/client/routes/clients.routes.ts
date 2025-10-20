import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.get('/list', ClientController.getAllClients)
clientRouter.post('/create', ClientController.createClient)

export default clientRouter;