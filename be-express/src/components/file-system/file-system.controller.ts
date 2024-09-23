import express, { Express, NextFunction, Request, Response } from 'express';
import { AppError } from "~/errors/app-error";
import FileSystemService from "./file-system.service";
import { FileSystemModel } from './file-system.model';
import { removeFile } from '~/helpers/file';

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

export const deleteForeverFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    //@ts-ignore
    const userId = req.userId;
    const id: string | number = req.params.id;
    const file = await fileSystemService.getFileSystem(id);

    if (!file) throw new AppError('Cannot find this file', 404);
    let files: any = [file];
    if (file.type == 'folder') {
        const descendant = await fileSystemService.findDescendant(id, 10);
        files = [...files, ...descendant];
    }
    for (const file of files) {
        try {
            if (file.type == 'file') {
                await removeFile(file?.metaData?.path);
            }
        } catch (error: any) {
            console.log(error.message);
        }
        await fileSystemService.deleteForever(file._id);
    }
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

export const getTotalSize = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = String(req.userId);

    const result = await FileSystemModel.aggregate([
        { $match: { type: 'file', userId } },
        {
            $group: {
                _id: null,
                totalSize: { $sum: '$metaData.size' }
            }
        }
    ]);
    // Extract the total size from the result
    const totalSize = result.length > 0 ? result[0].totalSize : 0;
    res.status(200).json({
        data: totalSize
    });
};

export const getTopSizeFiles = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = String(req.userId);
    let { page = 1, limit = 10, ord = -1, fileType }: any = req.query;
    page = Number(page);
    limit = Number(limit);
    ord = Number(ord);
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    const match: any = { type: 'file', userId, isDeleted: false };
    if (fileType) match["metaData.fileType"] = fileType;
    const topFiles = await FileSystemModel.aggregate([
        { $match: match }, // Filter by type 'file' and specific userId
        { $sort: { 'metaData.size': ord } }, // Sort by metaData.size in descending order
        { $skip: skip }, // Skip documents to achieve pagination
        { $limit: limit }, // Limit the number of documents to the specified limit
    ]);

    res.status(200).json({
        data: topFiles
    });
};

export const searchFiles = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = String(req.userId);
    const fileSystemService = new FileSystemService();

    let { text }: any = req.query;
    console.log(text);
    const data = await fileSystemService.query(userId, text);
    res.status(200).json({
        data
    });
};