import { NextFunction, Request, Response } from 'express';

import axios from 'axios';
import FileSystemService from '../file-system/file-system.service';

const fileSystemService = new FileSystemService();


export const searchFolder = async (req: Request, res: Response, next: NextFunction) => {
    // get file, check name file, move file to, 
    //@ts-ignore
    // const userId = req.userId;
    const { fileSystemId, limit = 3, type, query }: any = req.query;
    const data = await fileSystemService.findDescendant(fileSystemId, 10);
    const filteredData = data.filter((data) => data.type == 'file' && data?.metaData?.mimetype?.includes(type));
    const fileIds = filteredData.map((file) => file._id);
    let result: any = [];
    for (const fileId of fileIds) {
        try {
            const res = await axios.post("http://localhost:4000/api/search/video", {
                query,
                limit: 3,
                fileId
            });
            result = result.concat(res.data.Address);
            // console.log(fileId, res.data.Address);
        } catch (error: any) {
            console.log(error.message || '');
        }
    }
    // console.log(result);
    return res.status(200).json({
        data: result
    });
};
// file -> need to insert database to know place to get 