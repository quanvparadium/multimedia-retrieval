import { NextFunction, Request, Response } from 'express';
import uploadService from './upload.service';
import { AppError } from '~/errors/app-error';
import { Fields, Files } from 'formidable';
import FileSystemService from '../file-system/file-system.service';
import generateUniqueName from './helpers/generateNames';
import { IMetaData } from '../file-system/file-system';
import { UPLOAD_STORE_DIR } from '~/config/constant';
import { moveFile } from '~/helpers/file';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    const url = await uploadService.uploadImage(req as any);
    res.json({
        message: 'Upload image(s) successfully',
        result: url
    });
};

export const uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    const url = await uploadService.uploadVideo(req as any);
    res.json({
        message: 'Upload video successfully',
        result: url
    });
};

export const upload = async (req: Request, res: Response, next: NextFunction) => {
    // get file, check name file, move file to, 
    //@ts-ignore
    const userId = req.userId;
    const { files }: { files: Files; } = req.body;
    const folderId = req.params.folderId;
    if (typeof folderId != "string") throw new AppError("FolderId is not string", 400);
    const fileSystemService = new FileSystemService();
    const siblings = await fileSystemService.findDescendant(folderId, 1);
    const siblingNames = siblings.map((sibling) => sibling.name);

    if (files.blobs) {
        for (const blob of files.blobs) {
            const fileName = generateUniqueName(blob.originalFilename ?? "", siblingNames);
            if (!blob.mimetype) continue;
            const [_, ext] = blob.mimetype.split('/');
            const metaData: IMetaData = {
                size: blob.size,
                mimetype: blob.mimetype,
                storage: 'local',
                location: UPLOAD_STORE_DIR
            };
            const newFileSystem = await fileSystemService.create({ name: fileName, type: 'file', parentId: folderId, userId, metaData });
            // Save file to this place
            await moveFile(blob.filepath, `${UPLOAD_STORE_DIR}/${newFileSystem.id}.${ext}`);
            siblingNames.push(fileName);
        }
    }

    res.json({
        message: 'Upload video successfully'
    });
};
// file -> need to insert database to know place to get 