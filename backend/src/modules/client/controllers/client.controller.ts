import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import { createClientSchema } from "../schemas/client.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";

import { createClientService, getAllClientsService } from "../services";

export class ClientController {
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
