import { ObjectId, Document } from 'mongodb';
// Define the type for FileSystem type
export type IFileSystemType = 'file' | 'folder';

export interface IMetaData {
    storage?: string,
    location?: string,
    size?: number,
    mimetype?: string | null;
    thumbNailId?: mongoose.Types.ObjectId;
    path?: string;
}

export interface IFileSystem extends Document {
    childrenIds: mongoose.Types.ObjectId[];
    parentId: mongoose.Types.ObjectId | null;
    type: FileSystemType;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    openedAt: Data;
    userId: mongoose.Types.ObjectId;
    metaData?: IMetaData;
}

export interface IFileSystemWithLayer extends IFileSystem {
    layer: number;
};