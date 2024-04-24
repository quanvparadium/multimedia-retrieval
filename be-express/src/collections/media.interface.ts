export enum MediaType {
    Image,
    Video
}

export interface Media {
    url: string
    type: MediaType
}