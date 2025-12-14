import { Router } from "express";
import upload from '../../../shared/config/multer';
import { ReelsController } from "../controllers/reels.controller";

const reelsRouter = Router();

reelsRouter.get('/', ReelsController.getReels)
reelsRouter.get('/:id', ReelsController.getReelById)

reelsRouter.post('/schedule-reel', upload.single('reel'), ReelsController.scheduleReel)

export default reelsRouter;