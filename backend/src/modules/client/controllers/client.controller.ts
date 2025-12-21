import { Request, Response } from "express";
import { SocialIdentity } from "@prisma/client"; 

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

  static async getAllClients(req: Request, res: Response) {
    // Extraer parámetros de query 
    const {
      page = "1",
      limit = "10",
      social_identity,
      search,
    } = req.query;

    // Convertir a números
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validar social_identity 
    const socialIdentity = social_identity
      ? (social_identity as SocialIdentity)
      : undefined;

    // Llamar al servicio con filtros
    const result = await getAllClientsService({
      page: pageNum,
      limit: limitNum,
      social_identity: socialIdentity,
      search: search ? String(search) : undefined,
    });

    res.json(result); // { clients, total, page, totalPages, hasNext, hasPrev }
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