import express, { Express, NextFunction, Request, Response } from 'express';
import FileSystemService from '../file-system/file-system.service';
import MediaService from './media.service';
import { AppError } from '~/errors/app-error';


const fileSystemService = new FileSystemService();
const mediaService = new MediaService();


export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    // const userId = req.userId;
    const imageId = req.params.id;

    // const isOwner = await fileSystemService.isOwner(imageId, userId);
    // if (!isOwner) throw new AppError(`User ${userId} cannot access fileSystem ${imageId}`, 403);
    
    const fileSystem: any = await fileSystemService.getFileSystem(imageId);
    if (!fileSystem?.metaData?.mimetype?.includes('image')) throw new AppError(`FileType is not correct`, 400);
    const imageStream = await mediaService.serve(fileSystem);
    return imageStream.pipe(res);
};

export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    // const userId = req.userId;
    const videoId = req.params.id;
    // const isOwner = await fileSystemService.isOwner(videoId, userId);
    // if (!isOwner) throw new AppError(`User ${userId} cannot access fileSystem ${videoId}`, 403);

    const fileSystem: any = await fileSystemService.getFileSystem(videoId);
    if (!fileSystem?.metaData?.mimetype?.includes('video')) throw new AppError(`FileType is not correct`, 400);


    const range = req.headers.range;
    if (!range) throw new AppError(`Require range in headers`, 400);
    const videoSize = fileSystem?.metaData?.size;
    const chunkSize = 10 ** 6;
    const start = Number(range?.replace(/\D/g, ''));
    const end = Math.min(start * chunkSize, videoSize - 1);
    const contentLength = end - start + 1;
    const contentType = fileSystem?.metaData?.mimetype;
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType
    };
    res.writeHead(206, headers);

    const videoStream = await mediaService.serve(fileSystem, { start, end });
    return videoStream.pipe(res);
};
