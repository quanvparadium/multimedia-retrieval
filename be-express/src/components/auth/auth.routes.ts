import express, { Request, Response } from 'express';
import { login, refreshToken, signUp } from './auth.controller';
import { catchCtrl } from '~/helpers/catchController';

const authRoutes = express.Router();

authRoutes.use('/signup', catchCtrl(signUp));
authRoutes.use('/login', catchCtrl(login));
authRoutes.use('/refreshToken', catchCtrl(refreshToken));

export default authRoutes;
