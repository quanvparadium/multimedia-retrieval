import ImageFile from "./ImageFile";
import VideoFile from "./VideoFile";

export default function File({ file }: IFileProps) {
  if (file.type == "video") return <VideoFile file={file} />;
  if (file.type == "image") return <ImageFile file={file} />;

  return <></>;
}

export interface IFileProps {
  file: IFile;
}

export interface IFile {
  type: string;
  name: string;
  thumbnail: string;
  link: string;
  size: string;
}
