import { ThumbnailModel } from "./thumbnail.model";
import fsPromises from 'fs/promises';
import fs from 'fs';
import express, { Express, NextFunction, Request, Response } from 'express';


export const serveThumbNailController = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    // const userId = req.userId;
    const thumbnailId = req.params.id;
    // const isOwner = await fileSystemService.isOwner(imageId, userId);
    // if (!isOwner) throw new AppError(`User ${userId} cannot access fileSystem ${imageId}`, 403);

    const thumbnail: any = await ThumbnailModel.findById(thumbnailId);
    if (!thumbnail) throw new Error("Thumbnail is not exist");
    const { ext, id, location, storage } = thumbnail;
    if (storage === 'local') {
        const filePath = `${location}/${id}.${ext}`;
        await fsPromises.access(filePath);
        const imageStream = fs.createReadStream(filePath);
        return imageStream.pipe(res);
    } else {
        throw new Error(`Unsupported storage type: ${storage}`);
    }
};