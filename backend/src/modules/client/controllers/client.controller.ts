import { Request, Response } from "express";
import { validateSchema } from "../../../shared/utils/zodValidation";
import { createClientSchema } from "../schemas/client.schema";
import { HttpCode } from "../../../shared/enums/HttpCode";
import { createClientService } from "../services/createClient.service";

export class ClientController {
  static async createClient(req: Request, res: Response) {
    const accountData = await validateSchema(createClientSchema, req.body);

    await createClientService(accountData);

    res.sendStatus(HttpCode.CREATED);
  }
}
