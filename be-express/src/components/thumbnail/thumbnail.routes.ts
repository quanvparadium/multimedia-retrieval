import { Router } from 'express';
import { serveThumbNailController } from './thumbnail.controller';
import { catchCtrl } from '~/helpers/catchController';


const thumbnailRouter = Router();

thumbnailRouter.get('/:id', catchCtrl(serveThumbNailController));
// staticRouter.get('/videos-stream/:id', serveVideoStreamController)

export default thumbnailRouter;
