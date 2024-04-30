import { AppError } from '~/errors/app-error';
import { UserService } from '../user/user.service';
import { getValueAtPath } from '~/helpers/folder';

export default class FileSystemService {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async createFolder(args: ICreateFolder) {
        const { userId, path, folderName } = args;
        const folderPathInMongo = this.convertPathToPathInMongo(path);
        //1. Check type of path
        const pathType = await this.getTypeOfPath(userId, folderPathInMongo);
        if (pathType != 'folder') throw new AppError(`Path ${path} is not folder`, 400);
        //2. Add folder with value = {}
        const newFolderPath = `${folderPathInMongo}.${folderName}`;
        await this.addNewFileSystem(userId, newFolderPath, {});
    }

    public async createFile(args: ICreateFile) {
        const { userId, path, fileName, fileId } = args;
        const folderPathInMongo = this.convertPathToPathInMongo(path);
        //1. Check type of path
        const pathType = await this.getTypeOfPath(userId, folderPathInMongo);
        if (pathType != 'folder') throw new AppError(`Path ${path} is not folder`, 400);
        //2. Add file with value = fileId
        const newFilePath = `${folderPathInMongo}.${fileName}`;
        await this.addNewFileSystem(userId, newFilePath, fileId);
    }

    public async getFileSystemOfFolder(userId: number, path: string) {
        const folderPathInMongo = this.convertPathToPathInMongo(path);
        const userCollection = this.userService.collection;
        const pathType = await this.getTypeOfPath(userId, folderPathInMongo);
        if (pathType != 'folder')
            throw new AppError('Type of path is file, so you need to try another path', 400);
        //1. Get folders in folder
        const folderCursor = userCollection.aggregate([
            {
                $match: {
                    id: userId
                }
            },
            {
                $project: {
                    [folderPathInMongo]: 1
                }
            },
            {
                $addFields: {
                    dir: { $objectToArray: `$${folderPathInMongo}` }
                }
            },
            {
                $unwind: '$dir'
            },
            {
                $match: {
                    'dir.v': { $type: 'object' }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$dir.k',
                }
            }
        ]);

        folderCursor.map((doc) => doc);
        const folders = await folderCursor.toArray();
        //2. Get files in folder
        const fileCursor = userCollection.aggregate([
            {
                $match: {
                    id: userId
                }
            },
            {
                $project: {
                    [folderPathInMongo]: 1
                }
            },
            {
                $addFields: {
                    dir: { $objectToArray: `$${folderPathInMongo}` }
                }
            },
            {
                $unwind: '$dir'
            },
            {
                $match: {
                    'dir.v': { $type: ['string', 'number'] }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$dir.k',
                    value: '$dir.v'
                }
            }
        ]);
        fileCursor.map((doc) => doc);
        const files = await fileCursor.toArray();
        return { folders, files };
    }

    private convertPathToPathInMongo(path: string) {
        const pathToFolder = path
            .split('/')
            .filter((unit: string) => unit != '')
            .map((unit: string) => `.${unit}`)
            .join('');
        const folderPathInMongo = `folder${pathToFolder}`;
        return folderPathInMongo;
    }

    private async findCollectionWithPath(userId: number, pathInMongo: string) {
        const userCollection = this.userService.collection;
        return await userCollection.findOne(
            {
                id: userId,
                [pathInMongo]: { $exists: true }
            },
            {
                projection: {
                    [pathInMongo]: 1
                }
            }
        );
    }

    private async getTypeOfPath(userId: number, path: string) {
        const collection = await this.findCollectionWithPath(userId, path);
        if (!collection) throw new AppError(`Path ${path} cannot found`, 404);
        return typeof getValueAtPath(collection, path) == 'object' ? 'folder' : 'file';
    }

    private async addNewFileSystem(userId: number, path: string, value: any) {
        const collectionWithNewFolder = await this.findCollectionWithPath(userId, path);
        const userCollection = this.userService.collection;
        if (collectionWithNewFolder) throw new AppError(`Path ${path} is exist before`, 400);
        await userCollection.updateOne(
            { id: userId },
            {
                $set: {
                    [path]: value
                }
            }
        );
    }
}

interface ICreateFolder {
    userId: number;
    path: string;
    folderName: string;
}

interface ICreateFile {
    userId: number;
    path: string;
    fileName: string;
    fileId: number;
}
