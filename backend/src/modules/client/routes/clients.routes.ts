import { Router } from "express";
import { ClientController } from "../controllers/client.controller";

const clientRouter = Router();

clientRouter.get('/list', ClientController.getAllClients)
clientRouter.post('/create', ClientController.createClient)

clientRouter.get('/:id', ClientController.getClientById)
clientRouter.patch('/:id', ClientController.updateClient)
clientRouter.delete('/:id', ClientController.deleteClient)

export default clientRouter;