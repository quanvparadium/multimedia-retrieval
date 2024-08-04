import { NextFunction, Request, Response } from 'express';

import axios from 'axios';
import FileSystemService from '../file-system/file-system.service';

const fileSystemService = new FileSystemService();


export const searchFolder = async (req: Request, res: Response, next: NextFunction) => {
    // get file, check name file, move file to, 
    //@ts-ignore
    const userId = req.userId;
    let { fileSystemId, limit = 3, type, query }: any = req.query;
    if (!fileSystemId) {
        fileSystemId = await fileSystemService.getIdRootFolder(userId);
    }
    const data = await fileSystemService.findDescendant(fileSystemId, 10);
    const filteredData = data.filter((data) => data.type == 'file' && data?.metaData?.mimetype?.includes(type));
    const fileIds = filteredData.map((file) => file._id);
    let result: any = [];
    try {
        const res = await axios.post("http://localhost:4000/api/search/folder/keyframe/text", {
            query,
            limit: 4,
            files: fileIds
        });
        result = res.data.result;
    } catch (error: any) {
        console.log(error.response.data);
    }
    // console.log(result);
    return res.status(200).json({
        data: result
    });
};

export const querySearch = async (req: Request, res: Response, next: NextFunction) => {
    // get file, check name file, move file to, 
    //@ts-ignore
    const userId = req.userId;
    const { files, fields }: any = req.body;
    const query = fields.query[0];
    const type = fields.type[0];
    const file = files.file?.[0];

    let fileSystemId = fields.fileSystemId[0];
    if (!fileSystemId) {
        fileSystemId = await fileSystemService.getIdRootFolder(userId);
    }
    const data = await fileSystemService.findDescendant(fileSystemId, 10);
    const filteredData = data.filter((data) => data.type == 'file' && data?.metaData?.mimetype?.includes(type));
    const fileIds = filteredData.map((file) => file._id);

    let result: any = [];
    if (!file) {
        const res = await axios.post("http://localhost:4000/api/search/folder/keyframe/text", {
            query,
            limit: 4,
            files: fileIds
        });
        result = res.data.result;
    }
    else {
        const res = await axios.post("http://localhost:4000/api/search/folder/keyframe/image", {
            image_path: file.filepath,
            limit: 4,
            files: fileIds
        });
        console.log(res.data);
        result = res.data.result;
    }
    res.status(200).json({
        data: result
    });
};
// file -> need to insert database to know place to get 