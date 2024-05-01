import express, { Request, Response } from 'express';
import { login, refreshToken, signUp } from './auth.controller';
import { catchCtrl } from '~/helpers/catchController';

const authRoutes = express.Router();

authRoutes.post('/signup', catchCtrl(signUp));
authRoutes.post('/login', catchCtrl(login));
authRoutes.post('/refreshToken', catchCtrl(refreshToken));

export default authRoutes;
