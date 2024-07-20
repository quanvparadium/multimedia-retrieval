import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { upload } from './upload.controller';
import { formDataMiddleware } from './upload.middleware';

const uploadRoutes = express.Router();
uploadRoutes.route('/:folderId').post(catchCtrl(identify), catchCtrl(formDataMiddleware), catchCtrl(upload));

// uploadRoutes.post('/videos', catchCtrl(identify), catchCtrl(uploadVideo));

export default uploadRoutes;