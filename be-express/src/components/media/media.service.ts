import { IFileSystem } from "../file-system/file-system";
import fsPromises from 'fs/promises';
import fs from 'fs';

export default class MediaService {
    async serve(fileSystem: IFileSystem, options?: IOptions) {
        const { metaData, type, id } = fileSystem;
        if (type !== 'file')
            throw new Error("Cannot serve data with type other than 'file'");

        if (!metaData)
            throw new Error("MetaData is missing");

        const { mimetype, location, storage } = metaData;
        if (!mimetype || !location || !storage)
            throw new Error("Missing information in MetaData");

        const [kind, ext]: any = mimetype.split('/');
        const mediaInfo: IMediaInfo = {
            ext,
            id,
            location,
            storage
        };
        if (kind == 'image') return this.serveImage(mediaInfo);
        else if (kind == 'video') return this.serveVideo(mediaInfo, options);
        else throw new Error(`Kind ${kind} is not supported`);
    }

    async serveImage(mediaInfo: IMediaInfo) {
        const { ext, id, location, storage } = mediaInfo;
        if (storage === 'local') {
            const filePath = `${location}/${id}.${ext}`;
            await fsPromises.access(filePath);
            const imageStream = fs.createReadStream(filePath);
            return imageStream;
        } else {
            throw new Error(`Unsupported storage type: ${storage}`);
        }
    }

    async serveVideo(mediaInfo: IMediaInfo, options?: IOptions) {
        const { ext, id, location, storage } = mediaInfo;
        if (!options) throw new Error("Lack options for video");
        const { start, end } = options;
        if (storage === 'local') {
            const filePath = `${location}/${id}.${ext}`;
            await fsPromises.access(filePath);
            const videoStream = fs.createReadStream(filePath, { start, end });
            return videoStream;
        } else {
            throw new Error(`Unsupported storage type: ${storage}`);
        }
    };
}



interface IMediaInfo {
    ext: string;
    id: string;
    location: string;
    storage: string;
}

interface IOptions {
    start: number;
    end: number;
}