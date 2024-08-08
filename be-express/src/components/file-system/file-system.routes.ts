import express from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { changeFileName, createFolder, deleteFileSystem, downloadFile, getDeletedFileSystem, getFileSystem, getParent, getRecentFileSystems, getRootFileSystem, restoreFileSystem } from './file-system.controller';

const folderRoutes = express.Router();
//what we need to do. 
folderRoutes.route('/recent').get(catchCtrl(identify), catchCtrl(getRecentFileSystems));

folderRoutes
    .route('/')
    .post(catchCtrl(identify), catchCtrl(createFolder))
    .get(catchCtrl(identify), catchCtrl(getFileSystem));

folderRoutes.route('/:id').delete(catchCtrl(identify), catchCtrl(deleteFileSystem));

folderRoutes.route('/:id/restore').put(catchCtrl(identify), catchCtrl(restoreFileSystem));

folderRoutes.route("/recentDeleted").get(catchCtrl(identify), catchCtrl(getDeletedFileSystem));

folderRoutes.route('/my-drive').get(catchCtrl(identify), catchCtrl(getRootFileSystem));

folderRoutes.get('/:id/parent', catchCtrl(getParent));

folderRoutes.get('/:id/download', catchCtrl(downloadFile));

folderRoutes.put('/:id/rename/:name', catchCtrl(changeFileName));

// folderRoutes.route('/rename').post(catchCtrl(identify), catchCtrl(renameFileOrFolder));

export default folderRoutes;
