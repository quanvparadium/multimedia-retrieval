import express, { Request, Response } from 'express';
import { catchCtrl } from '~/helpers/catchController';
import { querySearch, searchFolder } from './search.controller';
import { identify } from '../auth/auth.middleware';
import { formDataMiddleware } from '../upload/upload.middleware';


const searchRoutes = express.Router();
searchRoutes.route('/files').get(catchCtrl(identify), catchCtrl(searchFolder))
    .post(catchCtrl(identify), catchCtrl(formDataMiddleware), catchCtrl(querySearch));

export default searchRoutes;