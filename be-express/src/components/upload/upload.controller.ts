import { NextFunction, Request, Response } from 'express';
import uploadService from './upload.service'; 


export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    const url = await uploadService.handleUploadImage(req as any)
    res.json({
        message: 'Upload successfully',
        result: url
    })
}