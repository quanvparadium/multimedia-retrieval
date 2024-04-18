import { NextFunction, Request, Response } from 'express';
import { ACCESS_KEY } from '~/config';
import { AppError } from '~/errors/app-error';
import { JWT } from '~/helpers/jwt';

export const identify = async (req: Request, res: Response, next: NextFunction) => {
    const jwt = new JWT(ACCESS_KEY);
    // 1) Getting token and check it
    let accessToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        accessToken = req.headers.authorization.split(' ')[1];

    if (!accessToken) return next(new AppError('accessToken is not valid', 401));

    // 2) Verify accessToken
    let data: any;
    try {
        data = jwt.verify(accessToken);
    } catch (error: any) {
        throw new AppError(`accessToken encounter ${error.message} `, 401);
    }
    // @ts-ignore: Add identify for user
    req.userId = data.id;
    next();
};
