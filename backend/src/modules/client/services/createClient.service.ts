import { getUserPagesWithInstagramAccountsService } from "../../meta/services";

import { ClientData } from "../interfaces/clientData.interface";
import { ClientModel } from "../models/client.model";

export const createClientService = async (accountData: ClientData) => {
  const { instagram_business_account } =
    await getUserPagesWithInstagramAccountsService(
      accountData.long_lived_token
    );

  const { id: instaId } = instagram_business_account;

  accountData.insta_id = instaId;

  await ClientModel.createAccount(accountData);
};
