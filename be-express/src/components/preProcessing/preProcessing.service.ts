import axios from "axios";
import ThumbnailService from "../thumbnail/thumbnail.service";
import { FileSystemModel } from "../file-system/file-system.model";
// import { pdf } from "pdf-to-img";
import { promises as fs } from 'fs';
import { STORE_DIR, UPLOAD_STORE_DIR } from "~/config/constant";

export default class PreProcessingService {
    private thumbnailService;
    constructor() {
        this.thumbnailService = new ThumbnailService();
    }


    async handle(newFileSystem: any, kind: string) {
        try {
            switch (kind) {
                case 'video':
                    return this.handleVideo(newFileSystem);
                case 'image':
                    return this.handleImage(newFileSystem);
                case 'application':
                    return this.handleDocument(newFileSystem);
                default:
                    throw new Error("Not support this type");
            }
        } catch (error: any) {
            console.log(error.message);
        }
    }

    async handleImage(newFileSystem: any) {
        const { userId, id, metaData } = newFileSystem;
        const { mimetype, path, storage } = metaData;
        const [_, ext] = mimetype.split('/');

        const thumbNailId = await this.thumbnailService.createThumbNail(path, 'image');
        await FileSystemModel.findByIdAndUpdate(newFileSystem.id, {
            $set: {
                "metaData.thumbNailId": thumbNailId
            },
        },);

        axios.post("http://localhost:3002/api/preprocessing/image", {
            "user_id": String(userId),
            "file_id": id,
            format: ext,
            store: storage,
            "file_path": path
        }).catch((err) => {
            console.log(err.response.data.detail);
        });
    }

    async handleVideo(newFileSystem: any) {
        const { userId, id, metaData } = newFileSystem;
        const { mimetype, path, storage } = metaData;
        const [_, ext] = mimetype.split('/');

        const thumbNailId = await this.thumbnailService.createThumbNail(path, 'video');
        await FileSystemModel.findByIdAndUpdate(newFileSystem.id, {
            $set: {
                "metaData.thumbNailId": thumbNailId
            },
        },);

        axios.post("http://localhost:3002/api/preprocessing/video", {
            "user_id": String(userId),
            "file_id": id,
            format: ext,
            store: storage,
            "file_path": path
        }).catch((err) => {
            console.log(err.response.data.detail);
        });
    }

    async handleDocument(newFileSystem: any) {
        const { userId, id, metaData } = newFileSystem;
        const { mimetype, path, storage } = metaData;
        const [_, ext] = mimetype.split('/');
        const keyFrameDir = `${STORE_DIR}/keyframes/${id}`;
        await fs.mkdir(keyFrameDir, { recursive: true });
        const { pdf } = await import("pdf-to-img");
        const document = await pdf(path, { scale: 1 });
        let counter = 1;
        axios.post("http://localhost:3002/api/document", {
            "user_id": String(userId),
            "file_id": id,
            format: ext,
            store: storage,
            "file_path": path
        }).catch((err) => {
            console.log(err.response.data.detail);
        });
        for await (const image of document) {
            await fs.writeFile(`${keyFrameDir}/${id}_${counter}.jpg`, image);
            counter++;
        }
        const thumbNailId = await this.thumbnailService.createThumbNail(`${keyFrameDir}/${id}_1.jpg`, 'image');
        console.log(thumbNailId, 'hihi');
        await FileSystemModel.findByIdAndUpdate(newFileSystem.id, {
            $set: {
                "metaData.thumbNailId": thumbNailId
            },
        },);
    }

}