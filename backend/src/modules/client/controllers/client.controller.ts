import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { clientIdSchema, createClientSchema } from "../schemas/client.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";

import { createClientService, getAllClientsService, getClientByIdService } from "../services";

export class ClientController {
  static async getClientById(req: Request, res: Response) {
    const { id } = await validateSchema(clientIdSchema, req.params);

    const client = await getClientByIdService(id);

    res.json({ client });
  }

  static async getAllClients(_req: Request, res: Response) {
    const clients = await getAllClientsService();
    
    res.json({ clients });
  }

  static async createClient(req: Request, res: Response) {
    const accountData = await validateSchema(createClientSchema, req.body);

    await createClientService(accountData);

    res.sendStatus(HttpCode.CREATED);
  }
}
