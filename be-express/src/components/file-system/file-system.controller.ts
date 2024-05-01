import express, { Express, NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { AppError } from '~/errors/app-error';
import { getValueAtPath } from '~/helpers/folder';
import FileSystemService from './file-system.service';

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    const { path, folderName }: any = req.body;
    //@ts-ignore
    const userId = req.userId;
    if (typeof path != 'string' || !folderName) throw new AppError('Lack path or nameFolder', 400);
    await fileSystemService.createFolder({ userId, folderName, path });
    res.status(200).json({
        message: 'Create folder successfully'
    });
};

// export const createFile = async (req: Request, res: Response, next: NextFunction) => {
//     const fileSystemService = new FileSystemService();
//     const { path, fileName, fileId }: any = req.body;
//     //@ts-ignore
//     const userId = req.userId;
//     if (!path || !fileName || !fileId) throw new AppError('Lack path or nameFolder', 400);
//     await fileSystemService.createFile({ userId, fileId, fileName, path });
//     res.status(200).json({
//         message: 'Create folder successfully'
//     });
// };
export const getFileSystem = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    const { path }: any = req.body;
    //@ts-ignore
    const userId = req.userId;
    const { folders, files } = await fileSystemService.getFileSystemOfFolder(userId, path);
    res.status(200).json({
        data: {
            folders,
            files
        }
    });
};

export const renameFileOrFolder = async (req: Request, res: Response, next: NextFunction) => {
    const fileSystemService = new FileSystemService();
    const { path, newName }: any = req.body;
    //@ts-ignore
    const userId = req.userId;
    await fileSystemService.renameFileOrFolder(userId, path, newName);
    res.status(200).json({
        message: 'OK'
    });
};
