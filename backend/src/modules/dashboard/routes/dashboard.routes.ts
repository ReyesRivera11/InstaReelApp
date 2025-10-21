import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/", DashboardController.getDashboardData);

export default dashboardRouter;