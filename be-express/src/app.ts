import express, { Express, Request, Response } from 'express';
import { AppError } from './errors/app-error';
import errorHandler from './errors/error-handler';
import morgan from 'morgan';
import apiRoutes from './api.routes';
import staticRouter from './components/static/static.routes';
import keyframeRouter from './components/keyframe/keyframe.routes';

const app: Express = express();

app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));

app.use('/api', apiRoutes);
app.use('/static', staticRouter)
app.use('/keyframe', keyframeRouter)


app.all('*', (req, res, next) => {
    const err = new AppError(
        `Cant not find ${req.originalUrl} in this server`,
        404
    );
    return next(err);
});

app.use(errorHandler);

export default app;
