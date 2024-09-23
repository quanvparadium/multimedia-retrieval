import { Types } from "mongoose";
import { IFileSystemType, IFileSystemWithLayer, IMetaData } from "./file-system";
import { FileSystemModel } from "./file-system.model";
import { AppError } from "~/errors/app-error";
import client from "~/connections/meiliSearch";

const index = client.index('files');
index.updateSearchableAttributes(['name']);
index.updateFilterableAttributes(['id', 'user', 'type', 'fileType', 'createdAt', 'isDeleted']);

export default class FileSystemService {
    constructor() { }

    async create(fileSystemArgs: IFileSystemArgs) {
        let { name, type, userId, parentId, metaData } = fileSystemArgs;
        const isOwner = await this.isOwner(parentId, userId);
        if (!isOwner) throw new AppError(`User ${userId} cannot create child from parentId ${parentId}`, 403);

        const siblings = await this.findDescendant(parentId, 1);
        const isExist = siblings.findIndex((sibling) => sibling.name == name && sibling.layer == 1) >= 0;
        if (isExist) throw new AppError(`Duplicate name at the same folder in folder ${parentId}`, 409);

        const newFileSystem = new FileSystemModel({
            name,
            userId,
            type,
            childrenIds: [],
            parentId: parentId,
            metaData
        });

        await newFileSystem.save();
        await FileSystemModel.updateOne(
            { _id: parentId },
            { $addToSet: { childrenIds: newFileSystem._id } }
        );
        await index.addDocuments([{
            id: newFileSystem._id,
            name,
            user: userId,
            isDeleted: false,
            createdAt: Date.now(),
            fileType: metaData?.fileType,
            type
        }]);
        return newFileSystem;
    }

    async createRoot(userId: string | number) {
        const isCreateBefore = await FileSystemModel.findOne({
            userId
        });
        if (isCreateBefore) throw new Error(`Cannot create folder root for user ${userId}`);

        const newFileSystem = new FileSystemModel({
            userId,
            name: 'root',
            type: 'folder',
            childrenIds: [],
            parentId: null,
        });
        await newFileSystem.save();
    }

    async getFileSystem(id: string) {
        return await FileSystemModel.findById(id);
    }


    async getInfoFolder(id: string) {
        const ancestorData = await this.findAncestor(id);
        const childrenData = await this.findDescendant(id, 0);
        return { ancestorData, childrenData };
    }

    async getIdRootFolder(userId: string | number) {
        const rootFolder: any = await FileSystemModel.findOne({
            parentId: null,
            userId
        });
        const id = rootFolder._id;
        return id;
    }


    // user,videos, embedding
    async findDescendant(id: string, maxDepth: number = 10) {
        const res = await FileSystemModel.aggregate([{
            $match: {
                _id: new Types.ObjectId(id),
            },
        },
        {
            $graphLookup: {
                from: "filesystems",
                startWith: "$childrenIds",
                connectFromField: "childrenIds",
                connectToField: "_id",
                depthField: "layer",
                maxDepth,
                as: "descendantData",
                restrictSearchWithMatch: {
                    isDeleted: false
                }
            }
        }]);
        if (res.length == 0) throw new Error(`Cannot find FileSystem with id ${id}`);
        const data: IFileSystemWithLayer[] = res[0].descendantData;
        return data;
    }

    async findAncestor(id: string, maxDepth: number = 10) {
        const res = await FileSystemModel.aggregate([{
            $match: {
                _id: new Types.ObjectId(id),
            },
        },
        {
            $graphLookup: {
                from: "filesystems",
                startWith: "$_id",
                connectFromField: "parentId",
                connectToField: "_id",
                depthField: "layer",
                maxDepth: maxDepth,
                as: "ancestorData"
            }
        }]);

        if (res.length == 0) throw new Error(`Cannot find FileSystem with id ${id}`);
        const data: IFileSystemWithLayer[] = res[0].ancestorData;
        return data;
    }

    async isOwner(id: string, userId: string | number) {
        try {
            const fileSystem = await this.getFileSystem(id);
            if (!fileSystem) return false;
            if (fileSystem.userId == userId) return true;
            else return false;
        } catch (error) {
            return false;
        }
    }

    async setOpenedAt(id: string) {
        await FileSystemModel.findByIdAndUpdate(id, { $set: { openedAt: new Date() } });
    }

    async getRecentOpenedAt(userId: string, type: string) {
        const fileSystems = await FileSystemModel.find({ type, userId, isDeleted: false }).sort({ openedAt: -1 }).limit(30);
        return fileSystems;
    }

    async rename(id: string, newName: string) {
        const fileSystem: any = await this.getFileSystem(id);
        const parentId = fileSystem.parentId;
        const siblings = await this.findDescendant(parentId, 1);
        const isExist = siblings.findIndex((sibling) => sibling.name == newName) >= 0;
        if (isExist) throw new Error(`Duplicate name at the same folder in folder ${parentId}`);
        await FileSystemModel.findByIdAndUpdate(id, {
            name: newName
        });
    }

    async query(userId: string, text: string) {
        const searchResponse = await index.search(text, { filter: `user = ${userId} AND isDeleted = false` });
        return searchResponse.hits;
    }

    async move(id: string, preParentId: string, nextParentId: string) {

    }

    async delete(id: string) {
        await FileSystemModel.findByIdAndUpdate(id, {
            $set: {
                isDeleted: true,
                deletedAt: Date.now()
            }
        });
    }

    async deleteForever(id: string) {
        return await FileSystemModel.deleteOne({
            _id: id
        });
    }


    async restore(id: string) {
        await FileSystemModel.findByIdAndUpdate(id, {
            $set: {
                isDeleted: false,
                deletedAt: Date.now()
            }
        });
    }
}

interface IFileSystemArgs {
    parentId: string;
    userId: string | number;
    name: string;
    type: IFileSystemType;
    metaData?: IMetaData;
}

