import express, { Request, Response } from 'express';
import { logController } from './log.controller';


const logRoutes = express.Router();
logRoutes.route('/').post(logController);

export default logRoutes;