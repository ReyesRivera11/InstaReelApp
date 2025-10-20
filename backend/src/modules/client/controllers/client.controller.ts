import { Request, Response } from "express";

import { validateSchema } from "../../../shared/utils/zodValidation";
import {
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
} from "../schemas/client.schema";

import { HttpCode } from "../../../shared/enums/HttpCode";

import {
  createClientService,
  getAllClientsService,
  getClientByIdService,
  updateClientService,
} from "../services";
import { deleteClientService } from "../services/deleteClient.service";

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

  static async updateClient(req: Request, res: Response) {
    const { id } = await validateSchema(clientIdSchema, req.params);
    const { username, name, description } = await validateSchema(
      updateClientSchema,
      req.body
    );

    const clientData = { id, username, name, description };

    await updateClientService(clientData);

    res.sendStatus(HttpCode.OK);
  }

  static async deleteClient(req: Request, res: Response) {
    const { id } = await validateSchema(clientIdSchema, req.params);

    await deleteClientService(id);
    
    res.sendStatus(HttpCode.OK);
  }
}
