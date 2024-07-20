import express, { Express, NextFunction, Request, Response } from 'express';
import FileSystemService from '../file-system/file-system.service';



export const logController = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.userId;
    const fileSystemService = new FileSystemService();
    const { action, data } = req.body;
    if (action == "open") {
        const { fileSystemId } = data;
        await fileSystemService.setOpenedAt(fileSystemId);
    }
    return res.status(200).json({
        status: "OK"
    });
};
