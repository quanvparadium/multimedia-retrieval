import express, { Express, NextFunction, Request, Response } from 'express';
import { UserService } from './user.service';
import { AppError } from '~/errors/app-error';

export const getDataUser = async (req: Request, res: Response, next: NextFunction) => {
    const userService = new UserService();
    const user = await userService.repo.findOne({
        where: {
            // @ts-ignore: Add identify for user
            id: req.userId
        }
    });
    if (!user) throw new AppError(`User with this token is not exist`, 400);
    const data = { ...user, password: undefined };
    res.status(200).json({
        user: data
    });
};
