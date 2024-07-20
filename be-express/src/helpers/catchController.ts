import express, { NextFunction, Request, Response } from 'express';

type IControllerFunction = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const catchCtrl =
    (fn: IControllerFunction) =>
        (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
