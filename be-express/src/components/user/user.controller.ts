import express, { Express, NextFunction, Request, Response } from 'express';
import { UserService } from './user.service';
import { AppError } from '~/errors/app-error';
import { moveFile } from '~/helpers/file';
import { STORE_DIR } from '~/config/constant';
import fsPromises from 'fs/promises';
import fs from 'fs';

const userService = new UserService();

export const getDataUser = async (req: Request, res: Response, next: NextFunction) => {
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


export const changeAvatar = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.userId;
    const { files }: any = req.body;
    const avatarFile = files.file?.[0];
    const avatarId = `${userId}_${Date.now()}.jpeg`;
    const location = `${STORE_DIR}/avatars/${avatarId}`;
    await moveFile(avatarFile.filepath, location);
    const data = await userService.repo.update({ id: userId }, {
        avatar: avatarId
    });
    if (data) res.status(200).json({
        message: 'OK'
    });
    else res.status(500).json({
        message: "Not OK"
    });
};

export const getAvatar = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const avatarId: string = req.query.avatarId;
    const location = `${STORE_DIR}/avatars/${avatarId}`;

    if (location) {
        await fsPromises.access(location);
        const imageStream = fs.createReadStream(location);
        return imageStream.pipe(res);
    }
    else throw new AppError("Cannot find avatar", 404);
};

export const changeName = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.userId;
    const newName = req.params.name;
    const data = await userService.repo.update({ id: userId }, {
        name: newName
    });
    if (data) res.status(200).json({
        message: 'OK'
    });
    else res.status(500).json({
        message: "Not OK"
    });
};