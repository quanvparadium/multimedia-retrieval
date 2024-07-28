import { NextFunction, Request, Response, json } from 'express';
import fsPromises from 'fs/promises';
import fs from 'fs';
import { STORE_DIR } from '~/config/constant';
import { AppError } from '~/errors/app-error';

export const serveKeyFrame = async (req: Request, res: Response, next: NextFunction) => {
    const { fileId, keyframeNumber } = req.params;
    try {
        const filePath = `${STORE_DIR}/keyframes/${fileId}/${fileId}_${keyframeNumber}.jpg`;
        console.log(filePath);
        await fsPromises.access(filePath);
        const imageStream = fs.createReadStream(filePath);
        imageStream.pipe(res);
    } catch (error: any) {
        throw new AppError(error.message, 404);
    }
};
