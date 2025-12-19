import { SocialIdentity } from "@prisma/client";
import { getUserPagesWithInstagramAccountsService } from "../../meta/services";

import { ClientData } from "../interfaces/clientData.interface";
import { ClientModel } from "../models/client.model";

export const createClientService = async (accountData: ClientData) => {
  // Solo Instagram necesita long_lived_token + insta_id
  if (accountData.social_identity === SocialIdentity.INSTAGRAM) {
    if (!accountData.long_lived_token) {
      throw new Error(
        "Instagram clients require a long_lived_token"
      );
    }

    const { instagram_business_account } =
      await getUserPagesWithInstagramAccountsService(
        accountData.long_lived_token
      );

    const { id: instaId } = instagram_business_account;
    accountData.insta_id = instaId;
  }

  // Para X, TikTok, etc., se crea directo
  await ClientModel.createAccount(accountData);
};
