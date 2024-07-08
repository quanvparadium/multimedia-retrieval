import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { upload, uploadImage, uploadVideo } from './upload.controller';
import { formDataMiddleware } from './upload.middleware';

const uploadRoutes = express.Router();

uploadRoutes.post('/images', catchCtrl(uploadImage));

uploadRoutes.route('/:folderId').post(catchCtrl(identify), catchCtrl(formDataMiddleware), catchCtrl(upload));

uploadRoutes.post('/videos', catchCtrl(identify), catchCtrl(uploadVideo));

export default uploadRoutes;
