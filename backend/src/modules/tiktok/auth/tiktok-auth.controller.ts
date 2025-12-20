import { Request, Response } from "express";
import * as TikTokAuthService from "./tiktok-auth.service";

export const prepareTikTokClient = (req: Request, res: Response) => {
  return TikTokAuthService.prepareTikTokClient(req, res);
};

export const startTikTokAuth = (req: Request, res: Response) => {
  return TikTokAuthService.startTikTokAuth(req, res);
};

export const tiktokCallback = (req: Request, res: Response) => {
  return TikTokAuthService.tiktokCallback(req, res);
};

export const listTikTokClients = (req: Request, res: Response) => {
  return TikTokAuthService.listTikTokClients(req, res);
};

export const updateTikTokClient = (req: Request, res: Response) => {
  return TikTokAuthService.updateTikTokClient(req, res);
};

export const deleteTikTokClient = (req: Request, res: Response) => {
  return TikTokAuthService.deleteTikTokClient(req, res);
};
