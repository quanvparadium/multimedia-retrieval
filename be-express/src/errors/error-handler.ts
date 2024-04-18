import { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error';

const sendErrorProd = (err: AppError, res: Response) => {
    const { statusCode = 500, message = '' } = err;

    if (statusCode != 500) {
        res.status(statusCode).json({
            message
        });
    } else {
        res.status(statusCode).json({
            status: 'error',
            message: 'Something went very wrong'
        });
    }
};

const sendErrorDev = (err: AppError, res: Response) => {
    const { statusCode = 500, message = '', stack } = err;
    res.status(statusCode).json({
        message,
        stack,
        err
    });
};

const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (process.env.NODE_ENV === 'dev') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'prod') {
        sendErrorProd(err, res);
    }
};

export default errorHandler;
