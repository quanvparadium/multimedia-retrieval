import express from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { createFolder, getFileSystem, getRecentFileSystems, getRootFileSystem } from './file-system.controller';

const folderRoutes = express.Router();
//what we need to do. 

folderRoutes.route('/recent').get(catchCtrl(identify), catchCtrl(getRecentFileSystems));


folderRoutes
    .route('/')
    .post(catchCtrl(identify), catchCtrl(createFolder))
    .get(catchCtrl(identify), catchCtrl(getFileSystem));

folderRoutes.route('/my-drive').get(catchCtrl(identify), catchCtrl(getRootFileSystem));

// folderRoutes.route('/rename').post(catchCtrl(identify), catchCtrl(renameFileOrFolder));

export default folderRoutes;
