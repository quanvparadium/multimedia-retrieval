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
    const types = fields.type;
    const file = files.file?.[0];
    const limit = Number(fields.limit?.[0] ?? '4');
    let fileSystemId = fields.fileSystemId[0];
    let isAll = false;
    if (!fileSystemId) isAll = true;
    console.log(isAll);

    let result: any = {};
    // console.log(fields.types);
    let data: any;
    if (!isAll)
        data = await fileSystemService.findDescendant(fileSystemId, 10);

    for (const type of types) {
        try {
            let fakeType: any, filteredData, fileIds: any;
            if (!isAll) {
                fakeType = type == 'document' ? 'application' : type;
                filteredData = data.filter((data: any) => data.type == 'file' && data?.metaData?.mimetype?.includes(fakeType));
                fileIds = filteredData.map((file: any) => file._id);
            }
            let res: any;
            if (!file) {
                if (type == 'document') {
                    if (isAll) {
                        res = await axios.post("http://localhost:3002/api/document/search-all", {
                            query,
                            limit: limit * 4,
                            user_id: String(userId),
                        });
                    }
                    else {
                        res = await axios.post("http://localhost:3002/api/document/search-all", {
                            query,
                            limit,
                            user_id: String(userId),
                            files: fileIds
                        });
                    }
                }
                else {
                    // text;keyframe;all
                    if (isAll) {
                        res = await axios.post("http://localhost:3002/api/search/all/keyframe/text", {
                            query,
                            limit: limit * 20,
                            ocr: query,
                            prior: "semantic",
                            user_id: String(userId),
                            database_type: type
                        });
                    }
                    // text;keyframe;folder
                    else {
                        res = await axios.post("http://localhost:3002/api/search/folder/keyframe/text", {
                            query,
                            limit,
                            files: fileIds,
                            ocr: query,
                            prior: "semantic",
                            user_id: String(userId),
                            database_type: type
                        });
                        console.log(res);
                    }
                }
            }

            if (file) {
                if (isAll) {
                    res = await axios.post("http://localhost:3002/api/search/all/keyframe/image", {
                        image_path: file.filepath,
                        limit: limit * 4,
                        database_type: type,
                        user_id: String(userId),
                    });
                }
                else {
                    res = await axios.post("http://localhost:3002/api/search/folder/keyframe/image", {
                        image_path: file.filepath,
                        limit,
                        files: fileIds,
                        database_type: type,
                        user_id: String(userId),
                    });
                }
            }
            if (res) result[type] = res.data.result.data.map((data: any) => ({ ...data, type }));
        } catch (error: any) {
            console.log(error.response.data);
        }
    }

    // if (!file) {
    //     if (type != 'document') {
    //         const res = await axios.post("http://localhost:4000/api/search/folder/keyframe/text", {
    //             query,
    //             limit,
    //             files: fileIds
    //         });
    //         result = res.data.result;
    //     }
    //     else {
    //         const res = await axios.post("http://localhost:5000/api/document/search-folder", {
    //             query,
    //             limit,
    //             files: fileIds
    //         });
    //         result = res.data.result;
    //     }
    // }
    // else {
    //     const res = await axios.post("http://localhost:4000/api/search/folder/keyframe/image", {
    //         image_path: file.filepath,
    //         limit,
    //         files: fileIds
    //     });
    //     result = res.data.result;
    // }
    // result = result.map((data: any) => ({ ...data, type }));
    // console.log(result);
    res.status(200).json({
        data: result
    });
};
// file -> need to insert database to know place to get     