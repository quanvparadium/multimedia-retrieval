import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { createFolder, getFileSystem } from './file-system.controller';

const folderRoutes = express.Router();

folderRoutes
    .route('/')
    .post(catchCtrl(identify), catchCtrl(createFolder))
    .get(catchCtrl(identify), catchCtrl(getFileSystem));

export default folderRoutes;
