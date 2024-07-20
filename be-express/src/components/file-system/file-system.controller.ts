import express, { Express, NextFunction, Request, Response } from 'express';
import { AppError } from "~/errors/app-error";
import FileSystemService from "./file-system.service";

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    const { parentId, folderName }: any = req.body;
    //@ts-ignore
    const userId = req.userId;
    if (typeof parentId != 'string' || typeof folderName != 'string') throw new AppError('Lack path or nameFolder', 400);
    await fileSystemService.create({ userId, name: folderName, parentId, type: 'folder' });
    res.status(200).json({
        message: 'Create folder successfully'
    });
};

export const getFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    const { id }: any = req.query;
    //@ts-ignore
    const userId = req.userId;
    const isOwner = await fileSystemService.isOwner(id, userId);
    if (!isOwner) throw new AppError(`User ${userId} cannot access fileSystem ${id}`, 403);
    const { ancestorData, childrenData } = await fileSystemService.getInfoFolder(id);
    res.status(200).json({
        data: {
            ancestorData,
            childrenData
        }
    });
};

export const getRootFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const id = await fileSystemService.getIdRootFolder(userId);
    res.status(200).json({
        data: id
    });
};

export const getRecentFileSystems = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const { type }: any = req.query;
    const fileSystems = await fileSystemService.getRecentOpenedAt(userId, type);
    res.status(200).json({
        data: fileSystems
    });
};