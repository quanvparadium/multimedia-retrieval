import File, { IFile } from "./File";

export default function Files({ files }: IFilesProps) {
  if (!files?.length) return;
  return (
    <div className="">
      <p className="font-medium text-gray-600">Files</p>
      <div className="grid grid-cols-9 gap-3 mt-3">
        {files.map((file) => {
          return <File file={file} />;
        })}
      </div>
    </div>
  );
}

export interface IFilesProps {
  files: IFile[];
}
