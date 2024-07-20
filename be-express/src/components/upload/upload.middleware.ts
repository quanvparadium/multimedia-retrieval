import { NextFunction, Request, Response } from 'express';
import formidable, { Fields, Files, Part } from 'formidable';
import path from 'path';
import { UPLOAD_TEMP_DIR } from '~/config/constant';

export const formDataMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const userId = req.userId;
    const form = formidable({
        uploadDir: path.resolve(UPLOAD_TEMP_DIR),
        maxFiles: 10,
        maxFileSize: 1024 * 1024 * 1024, // 1 GB
        maxTotalFileSize: 10 * 1024 * 1024 * 1024, // 100 MB
        keepExtensions: true,
        createDirsFromUploads: true,
        filename: (name, ext, part) => {
            return `${userId}_${Date.now()}_${part.originalFilename}`;
        },
        filter: ({ name, originalFilename, mimetype }) => {
            // const whiteListNames = ['videos', 'files'];
            // const whiteListTypes = ['image', 'video'];
            // if (
            //     whiteListNames.find((whiteListName) => whiteListName == name)! != undefined &&
            //     whiteListTypes.find((whiteListType) => mimetype?.startsWith(whiteListType)) !=
            //         undefined
            // )
            //     return true;
            // else return false;
            // console.log(mimetype);
            return true;
        }
    });

    const { fields, files }: { files: Files; fields: Fields; } = await new Promise(
        (resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }
                return resolve({ files, fields });
            });
        }
    );

    req.body.files = files;
    req.body.fields = fields;
    next();
};
