import { Router } from "express";
import { PublicationController } from "../controllers/publication.controller";

const publicationRouter = Router();

publicationRouter.post('/schedule-reel', PublicationController.scheduleReel)

export default publicationRouter;