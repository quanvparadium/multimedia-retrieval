import express, { Request, Response } from 'express'
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { uploadImage } from './upload.controller';

const uploadRoutes = express.Router()

uploadRoutes.post('/image', catchCtrl(identify), catchCtrl(uploadImage))

export default uploadRoutes