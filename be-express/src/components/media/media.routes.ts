import { Router } from 'express';
import { serveDocumentController, serveImageController, serveVideoController } from './media.controller';
import { catchCtrl } from '~/helpers/catchController';

const mediaRouter = Router();

mediaRouter.get('/images/:id', catchCtrl(serveImageController));

mediaRouter.get('/videos/:id', catchCtrl(serveVideoController));

mediaRouter.get('/documents/:id', catchCtrl(serveDocumentController));

export default mediaRouter;