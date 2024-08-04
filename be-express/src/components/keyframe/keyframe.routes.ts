import { Router } from 'express';
import { serveKeyFrame } from './keyframe.controller';
import { catchCtrl } from '~/helpers/catchController';

const keyframeRouter = Router();

keyframeRouter.get('/:keyframeNumber/files/:fileId', catchCtrl(serveKeyFrame));

export default keyframeRouter;
