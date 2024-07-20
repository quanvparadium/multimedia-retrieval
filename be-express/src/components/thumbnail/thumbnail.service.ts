import path from "path";
import { UPLOAD_THUMBNAIL_DIR } from "./constant";
import { ThumbnailModel } from "./thumbnail.model";
import sharp from "sharp";
import ffmpeg from 'fluent-ffmpeg';


export default class ThumbnailService {
    constructor() {

    }

    async createThumbNail(filePath: string, kind: string) {
        let ext = path.extname(filePath);
        if (kind == 'video') ext = 'jpeg';
        const thumbNail = new ThumbnailModel({
            location: UPLOAD_THUMBNAIL_DIR,
            storage: "local",
            ext
        });
        const saveThumbNail = await thumbNail.save();
        const destPath = `${UPLOAD_THUMBNAIL_DIR}/${saveThumbNail.id}.${ext}`;
        if (kind == 'image') await this.createThumbnailImage(filePath, destPath);
        else if (kind == 'video') await this.createThumbnailVideo(filePath, destPath);
        return saveThumbNail.id;
    }

    async createThumbnailImage(filePath: string, destPath: string) {
        await sharp(filePath).resize(320, 240)
            .toFile(destPath);
    }

    async createThumbnailVideo(filePath: string, destPath: string) {
        const dirPath = path.dirname(destPath);
        const fileName = path.basename(destPath);
        return new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .screenshots({
                    timestamps: [0], // Capture at the 0 second mark
                    filename: fileName,
                    folder: dirPath,
                    size: '320x240'
                })
                .on('end', function () {
                    resolve(true);
                })
                .on('error', function (err: any) {
                    reject(new Error('Error extracting frame: ' + err.message));
                });
        });
    }

}