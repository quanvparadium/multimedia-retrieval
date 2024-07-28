import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { searchFolder } from './search.controller';


const searchRoutes = express.Router();
searchRoutes.route('/files').get(catchCtrl(searchFolder));


export default searchRoutes;