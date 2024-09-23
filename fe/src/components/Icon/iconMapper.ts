import { MdFolder, MdPictureAsPdf, MdImage, MdVideoFile } from "react-icons/md";

export const iconMapper: any = {
    video: {
        icon: MdVideoFile,
        color: 'red'
    },
    image: {
        icon: MdImage,
        color: 'orange'
    },
    folder: {
        icon: MdFolder,
        color: 'gray'
    },
    document: {
        icon: MdPictureAsPdf,
        color: 'orange'
    },
};