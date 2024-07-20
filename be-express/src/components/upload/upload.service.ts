// import path from "path";
// import { IFileSystem } from "../file-system/file-system";
// import FileSystemService from "../file-system/file-system.service";
// import { UPLOAD_TEMP_DIR } from "~/config/constant";
// import { getThumbnailImage } from "./helpers/screenShot";
// import ThumbnailService from "../thumbnail/thumbnail.service";

// class UploadService {
//     private fileSystemService: FileSystemService;
//     private thumbnailService: ThumbnailService;
//     constructor() {
//         this.fileSystemService = new FileSystemService();
//         this.thumbnailService = new ThumbnailService();
//     }

//     async upload(filePath: string, fileSystem: IFileSystem) {
//         const mimetype = fileSystem.metaData?.mimetype;
//         if (!mimetype) throw new Error(`fileSystem doesnot contain mimetype`);
//         const [kind, _] = mimetype.split('/');
//         if (kind == 'image') {
//             return this.uploadImage(filePath, fileSystem);
//         }
//         if (kind == "video") {
//             return this.uploadVideo(filePath, fileSystem);
//         }
//         throw new Error(`Kind is not supported`);
//     };

//     async uploadImage(filePath: string, fileSystem: IFileSystem) {
//         const mimetype: any = fileSystem.metaData?.mimetype;
//         const [_, ext] = mimetype.split('/');
//         const dirPath = path.dirname(filePath);
//         const thumbNailId = await this.thumbnailService.createThumbnail
//         const fileName = path.dirname(filePath);
//         const tempThumbnailPath = path.join(dirPath, `thumbnail_${fileName}`);
//         const thumbNailFile = await getThumbnailImage(filePath, tempThumbnailPath, 'image');

//         const thumbNail = {
//             userId: fileSystem.userId,
//             metaData: {
//                 location: fileSystem.metaData?.location,
//                 storage: fileSystem.metaData?.storage,
//                 mimetype: `image/${thumbNailFile.format}`
//             },
//             type: "file"
//         };
//         // const thumbNailSystem = await this.fileSystemService.create
//     }

//     async uploadVideo(filePath: string, fileSystem: IFileSystem) {
//         const mimetype: any = fileSystem.metaData?.mimetype;
//         const [_, ext] = mimetype.split('/');
//         const t;
//     }
// }

// export default UploadService;
