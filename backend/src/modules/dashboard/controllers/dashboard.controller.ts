import { Request, Response } from "express";

import { getDashboardDataService } from "../services";

export class DashboardController {
  static async getDashboardData(_req: Request, res: Response) {
    const dashboardData = await getDashboardDataService();

    res.json(dashboardData);
  }
}
