import { Router } from 'express';
import { serveImageController, serveVideoController } from './media.controller';
import { catchCtrl } from '~/helpers/catchController';

const mediaRouter = Router();

mediaRouter.get('/images/:id', catchCtrl(serveImageController));

mediaRouter.get('/videos/:id', catchCtrl(serveVideoController));

export default mediaRouter;