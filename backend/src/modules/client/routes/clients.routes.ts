import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.get('/list', ClientController.getAllClients)
clientRouter.get('/:id', ClientController.getClientById)

clientRouter.post('/create', ClientController.createClient)
clientRouter.patch('/:id', ClientController.updateClient)

export default clientRouter;