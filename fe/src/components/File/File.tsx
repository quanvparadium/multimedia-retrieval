import ImageFile from "./ImageFile";
import VideoFile from "./VideoFile";

export default function File({ file }: IFileProps) {
  if (!file?.metaData?.mimetype) return;
  const type = file.metaData.mimetype.split('/')[0];
  if (type == "video") return <VideoFile file={file} />;
  if (type == "image") return <ImageFile file={file} />;

  return <></>;
}

export interface IFileProps {
  file: IFile;
}

export interface IFile {
  type: string;
  name: string;
  _id: string;
  size: string;
  metaData: IMetaData;
}

interface IMetaData {
  storage?: string,
  location?: string,
  size?: number,
  mimetype?: string | null;
  thumbNailId: string;
}