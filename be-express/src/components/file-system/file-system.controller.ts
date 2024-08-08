import express, { Express, NextFunction, Request, Response } from 'express';
import { AppError } from "~/errors/app-error";
import FileSystemService from "./file-system.service";
import { FileSystemModel } from './file-system.model';

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

export const getParent = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const { id }: any = req.params;
    let fileSystems = await fileSystemService.findAncestor(id, 1);
    fileSystems = fileSystems.filter((file) => file.layer == 1);
    res.status(200).json({
        data: fileSystems[0]
    });
};

export const getName = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const { id }: any = req.params;
    let fileSystems = await fileSystemService.findAncestor(id, 1);
    fileSystems = fileSystems.filter((file) => file.layer == 1);
    res.status(200).json({
        data: fileSystems[0]
    });
};

export const changeFileName = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    // const userId = req.userId;
    const { id, name }: any = req.params;
    await fileSystemService.rename(id, name);
    res.status(200).json({
        message: "OK"
    });
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const id: string | number = req.params.id;
    const file: any = await fileSystemService.getFileSystem(id);
    const { metaData, type } = file;
    if (type !== 'file')
        throw new Error("Cannot download data with type other than 'file'");
    if (!metaData)
        throw new Error("MetaData is missing");
    const { mimetype, location, storage } = metaData;
    const [_, ext]: any = mimetype.split('/');
    const filePath = `${location}/${id}.${ext}`;
    res.setHeader('Content-Type', mimetype);
    res.download(filePath, file.name);
};


export const deleteFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const id: string | number = req.params.id;
    await fileSystemService.delete(id);
    res.status(200).json({
        message: "OK"
    });
};

export const restoreFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const id: string | number = req.params.id;
    await fileSystemService.restore(id);
    res.status(200).json({
        message: "OK"
    });
};

export const getDeletedFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.userId;
    const files = await FileSystemModel.find({ userId, isDeleted: true }).sort({ deletedAt: -1 });
    res.status(200).json({
        data: files
    });
};