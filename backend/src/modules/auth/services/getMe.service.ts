import { tokenService } from "../../../shared/services/tokens.service";
import { validateSchema } from "../../../shared/utils/zodValidation";
import { AuthModel } from "../models/auth.model";
import { jwtPayloadSchema } from "../schemas/auth.schema";

export const getMeService = async (accessToken: string) => {
  const decoded = tokenService.verifyAccessToken(accessToken);
  
  const { id } = await validateSchema(jwtPayloadSchema, decoded);

  const user = await AuthModel.getMe(id);

  return user;
};
