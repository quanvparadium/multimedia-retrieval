import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { changeAvatar, changeName, getAvatar, getDataUser } from './user.controller';
import { formDataMiddleware } from '../upload/upload.middleware';

const userRoutes = express.Router();

userRoutes.route('/me').get(catchCtrl(identify), catchCtrl(getDataUser));

userRoutes.route('/rename/:name').put(catchCtrl(identify), catchCtrl(changeName));

userRoutes.route('/avatar').put(catchCtrl(identify), catchCtrl(formDataMiddleware), catchCtrl(changeAvatar))
    .get(catchCtrl(getAvatar));



export default userRoutes;
