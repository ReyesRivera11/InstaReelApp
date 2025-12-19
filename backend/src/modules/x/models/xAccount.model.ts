import prisma from "../../../shared/lib/prisma";

export class XAccountModel {
  static async getByClientId(clientId: number) {
    return prisma.x_account.findUnique({
      where: { client_id: clientId },
    });
  }

  static async create(data: {
    client_id: number;
    x_user_id: string;
    username: string;
    access_token: string;
    refresh_token?: string;
    expires_at: Date;
  }) {
    return prisma.x_account.create({
      data,
    });
  }

  static async updateTokens(
    clientId: number,
    data: {
      access_token: string;
      refresh_token?: string;
      expires_at: Date;
    }
  ) {
    return prisma.x_account.update({
      where: { client_id: clientId },
      data,
    });
  }

  static async deleteByClientId(clientId: number) {
    return prisma.x_account.delete({
      where: { client_id: clientId },
    });
  }
}
