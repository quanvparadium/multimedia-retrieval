import express, { Request, Response } from 'express'
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { uploadImage, uploadVideo } from './upload.controller';

const uploadRoutes = express.Router()

uploadRoutes.post('/images', catchCtrl(identify), catchCtrl(uploadImage))

uploadRoutes.post('/videos', catchCtrl(identify), catchCtrl(uploadVideo))


export default uploadRoutes