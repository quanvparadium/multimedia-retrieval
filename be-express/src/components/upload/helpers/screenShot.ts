import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import sharp from 'sharp';

export const getThumbnailVideo = (srcPath: string, destPath: string) => {
    const dirPath = path.dirname(destPath);
    const fileName = path.basename(destPath);
    return new Promise((resolve, reject) => {
        ffmpeg(srcPath)
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
};

export const getThumbnailImage = (srcPath: string, destPath: string) => {
    return sharp(srcPath)
        .resize(320, 240)
        .toFile(destPath);
};

