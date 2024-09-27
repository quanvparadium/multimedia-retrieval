import File, { IFile } from "./File";

export default function Files({ files, focusedFile }: IFilesProps) {
  if (!files?.length) return;
  console.log(focusedFile, files);
  return (
    <div className="">
      <div className="grid grid-cols-6 gap-5 mt-3 ">
        {files.map((file) => {
          return <File file={file} key={file._id} isFocus={focusedFile == file._id} />;
        })}
      </div>
    </div>
  );
}

export interface IFilesProps {
  files: IFile[];
  focusedFile?: string;
}
