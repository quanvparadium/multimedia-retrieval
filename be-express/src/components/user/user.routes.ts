import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { identify } from '../auth/auth.middleware';
import { getDataUser } from './user.controller';

const userRoutes = express.Router();

userRoutes.route('/me').get(catchCtrl(identify), catchCtrl(getDataUser));

export default userRoutes;
