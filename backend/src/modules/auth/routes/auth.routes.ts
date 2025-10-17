import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', AuthController.logout);

authRoutes.post('/refresh', AuthController.refreshToken)