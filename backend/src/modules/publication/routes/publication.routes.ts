import { Router } from "express";
import { PublicationController } from "../controllers/publication.controller";
import upload from '../../../shared/config/multer';

const publicationRouter = Router();

publicationRouter.get('/list', PublicationController.getPublications)
publicationRouter.get('/:id', PublicationController.getPublicationById)

publicationRouter.post('/schedule-reel', upload.single('reel'), PublicationController.scheduleReel)

export default publicationRouter;