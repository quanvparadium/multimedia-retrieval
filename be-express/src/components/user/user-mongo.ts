interface FolderInMongo {
    [name: string]: FolderInMongo | string;
}

export interface UserInMongo {
    id: number;
    folder: FolderInMongo;
}
