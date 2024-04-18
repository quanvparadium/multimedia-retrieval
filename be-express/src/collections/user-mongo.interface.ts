interface Folder {
    [name: string]: Folder | string;
}

export interface User {
    id: string;
    folder: Folder;
}
