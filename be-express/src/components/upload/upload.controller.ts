import { NextFunction, Request, Response } from 'express';
import uploadService from './upload.service'; 


export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    const url = await uploadService.uploadImage(req as any)
    res.json({
        message: 'Upload image(s) successfully',
        result: url
    })
}

export const uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    const url = await uploadService.uploadVideo(req as any)
    res.json({
        message: 'Upload video successfully',
        result: url
    })
}