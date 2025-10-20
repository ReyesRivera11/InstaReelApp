import axios, { AxiosError } from "axios";
import { AppError } from "../../../core/errors/AppError";
import { HttpCode } from "../../../shared/enums/HttpCode";

import { META_API_URLS } from "../constants/meta.constants";

import { ClientProfileResponse } from "../interfaces/clientProfile.response";

export const getUserPagesWithInstagramAccountsService = async (access_token: string) => {
  try {
    const { data } = await axios.get<ClientProfileResponse>(
      META_API_URLS.INSTAGRAM_GRAPH.ME_ACCOUNT,
      {
        params: {
          access_token,
          fields: "id,name,instagram_business_account",
        },
      }
    );

    const clientProfile = data.data[0];

    return clientProfile;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: error.message,
      });
    }

    throw error;
  }
};