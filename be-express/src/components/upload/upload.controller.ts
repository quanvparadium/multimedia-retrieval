import { NextFunction, Request, Response } from 'express';
import { AppError } from '~/errors/app-error';
import { Files } from 'formidable';
import FileSystemService from '../file-system/file-system.service';
import generateUniqueName from './helpers/generateNames';
import { IMetaData } from '../file-system/file-system';
import { UPLOAD_STORE_DIR } from '~/config/constant';
import { moveFile } from '~/helpers/file';
import ThumbnailService from '../thumbnail/thumbnail.service';
import { FileSystemModel } from '../file-system/file-system.model';
import PreProcessingService from '../preProcessing/preProcessing.service';

const thumbNailService = new ThumbnailService();

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
            const [kind, ext] = blob.mimetype.split('/');
            let fileType = 'document';
            if (["video", "image"].includes(kind)) fileType = kind;
            console.log(fileType);
            const metaData: IMetaData = {
                size: blob.size,
                mimetype: blob.mimetype,
                storage: 'local',
                location: UPLOAD_STORE_DIR,
                fileType
            };
            let newFileSystem: any = await fileSystemService.create({ name: fileName, type: 'file', parentId: folderId, userId, metaData });
            const filePath = `${UPLOAD_STORE_DIR}/${newFileSystem.id}.${ext}`;
            newFileSystem = await FileSystemModel.findByIdAndUpdate(newFileSystem.id, {
                $set: {
                    "metaData.path": filePath
                },
            }, { new: true });
            // Save file to this place
            await moveFile(blob.filepath, newFileSystem.metaData.path);
            siblingNames.push(fileName);
            try {
                const preProcessing = new PreProcessingService();
                preProcessing.handle(newFileSystem, kind);
            } catch (error: any) {
                console.log(error.response.data.detail);
            }
        }
    }

    res.json({
        message: 'Upload video successfully'
    });
};