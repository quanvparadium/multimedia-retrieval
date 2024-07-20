import Layout from "../components/Layout";
import { useState, DragEvent } from "react";
import { axiosBase, axiosSearch } from "./axios";
import keyframe_id from "../../../services/features/keyframe_id.json";

export default function Home() {
  const [file, setFile] = useState<File | undefined>();
  const [imageLink, setImageLink] = useState<string>();
  const [keyframes, setKeyframes] = useState([]);

  const handleImageFile = (newFile: File) => {
    if (!newFile) return;
    if (!newFile.type.startsWith("image/")) return;
    const newImageLink = URL.createObjectURL(newFile);
    if (imageLink) URL.revokeObjectURL(imageLink);
    setImageLink(newImageLink);
    setFile(newFile);
  };

  const handleOnSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("file submit", file, e.target);
    const target = e.target as HTMLFormElement & {
      search: { value: string; };
      typedata: { value: string; };
      topk: { value: string; };
      OCR: { value: string; };
      Speech: { value: string; };
    };
    const payload = {
      query: target.search.value,
      dataset: target.typedata.value,
      topk: Number(target.topk.value),
      OCR: target.OCR.value,
      Speech: target.Speech.value,
    };
    console.log(payload);
    const result = await axiosSearch.post("/search/videos/", payload);
    // console.log(result)
    // setTimeout(() => {
    //     console.log('get keyframe')
    // }, 400)
    setKeyframes(result.data.result);
  };
  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const target = e.target as HTMLInputElement & {
      files: FileList;
    };
    handleImageFile(target.files[0]);
  };

  const handleDropImage = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer) return;
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  return (
    <Layout>
      <div className="h-1/4 vh-3/4 p-4">
        <form
          className="grid grid-cols-5 grid-rows-3 gap-2 bg-indigo-50 rounded-3xl p-6"
          // onClick = {() => {console.log('form')}}
          onSubmit={handleOnSubmit}
        >
          <div className="col-span-full lg:col-span-4">
            <input
              type="text"
              name="search"
              placeholder="Input your query"
              autoComplete="off"
              aria-label="Search talk"
              className="w-full pr-3 pl-10 py-2 font-semibold placeholder-gray-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
            />
          </div>

          <div className="col-start-1 col-end-3 row-start-2 row-end-4">
            <div className="flex items-center px-2 py-1 justify-center">
              <label
                htmlFor="OCR"
                className="block text-sm font-semibold text-gray-900 dark:text-white min-w-12 required"
              >
                OCR :
              </label>
              <input
                id="OCR"
                type="text"
                placeholder="Ex. VN Airline, stop, ..."
                name="ocr"
                autoComplete="off"
                aria-label="OCRSearch"
                className="w-full ml-4 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
              ></input>
            </div>
            <div className="flex items-center px-2 py-1 justify-center">
              <label
                htmlFor="Speech"
                className="block text-sm font-semibold text-gray-900 dark:text-white min-w-12 required"
              >
                Speech:
              </label>
              <input
                id="Speech"
                type="text"
                placeholder="Ex. VN Airline, stop, ..."
                name="speech"
                autoComplete="off"
                aria-label="SpeechSearch"
                className="w-full ml-4 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
              ></input>
            </div>
          </div>

          <div className="flex items-center">
            <label
              htmlFor="typedata"
              className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required"
            >
              Type data<span className="text-red-500">*</span> :
            </label>

            <select
              id="typedata"
              name="typedata"
              defaultValue={"Image"}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="col-start-3 col-end-4 row-start-2 row-end-4">
            <label htmlFor="input-file" id="drop-area">
              <input type="file" accept="image/*" id="input-file" hidden onChange={handleUpload} />
              <div
                id="img-view"
                className="m-auto h-full bg-red-100 cursor-pointer rounded-3xl bg-center bg-no-repeat text-center border-dashed border-2 border-indigo-600 hover:opacity-50"
                style={{
                  backgroundImage: imageLink ? `url(${imageLink})` : undefined,
                  border: imageLink ? "1px solid gray" : undefined,
                  borderRadius: imageLink ? "1rem" : undefined,
                  backgroundPosition: imageLink ? "center" : undefined,
                  backgroundSize: imageLink ? "contain" : undefined,
                  // backgroundRepeat: imageLink ? '' : undefined,

                  // width: imageLink ? '100%' : undefined,

                  // backgroundSize: imageLink ? 'cover' : undefined,
                }}
                onDrop={handleDropImage}
                onDragOver={(event) => event.preventDefault()}
              >
                <div
                  style={{
                    display: imageLink ? "none" : "block",
                  }}
                >
                  <img src="/508-icon.png" className="w-9 h-10 ml-auto mr-auto" />
                  <p className="text-xs">
                    Drag and drop <br className="hidden md:inline" /> or{" "}
                    <span className="text-blue-500 font-extrabold">click here</span>{" "}
                    <span className="hidden lg:inline"> to upload an image </span>
                  </p>
                </div>
              </div>
            </label>
          </div>
          <button
            type="button"
            className="px-2 py-1 bg-blue-400 w-3/4 rounded-xl mx-auto my-0.5 text-white font-semibold hover:border-blue-600 hover:border-solid hover:opacity-90 hover:border-2 hover:text-blue-400 hover:bg-white"
          >
            Choose folder
          </button>

          <div className="flex items-center">
            <label
              htmlFor="topk"
              className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required"
            >
              Top-k <span className="text-red-500">*</span> :
            </label>

            <select
              id="topk"
              defaultValue={200}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="200">200</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
          </div>
          <button
            type="button"
            className="px-2 py-1 bg-blue-400 w-3/4 rounded-xl mx-auto my-0.5 text-white font-semibold hover:border-blue-600 hover:border-solid hover:opacity-90 hover:border-2 hover:text-blue-400 hover:bg-white"
          >
            Choose file(s)
          </button>

          {/* <div className="grid grid-cols-2">
                      <button type="button" className="bg-blue-400 w-3/4 rounded-3xl mx-auto lg:my-1 md:my-0  md:py-1 text-white font-semibold hover:text-black hover:opacity-50">
                          Submit
                      </button>
                      <button type="submit" className="bg-blue-400 w-3/4 rounded-3xl mx-auto lg:my-1 md:my-0  md:py-1 text-white font-semibold hover:text-black hover:opacity-50">
                          Submit
                      </button>

                  </div> */}
          <button
            type="submit"
            className="bg-blue-400 w-3/4 rounded-3xl mx-auto lg:my-1 md:my-0  md:py-1 text-white font-semibold hover:text-black hover:opacity-50"
          >
            Submit
          </button>
        </form>

        <div className="grid grid-cols-1 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-auto h-3/4">
          {keyframes.map((value, idx) => {
            // const keyframeUrl = `http://localhost:${process.env.PORT || 3001}/keyframe/images?${value}`
            console.log(`http://localhost:${process.env.PORT || 3000}/keyframe/images?${value}`);
            const keyframeUrl = `http://localhost:${process.env.PORT || 3001}/keyframe/images?${value}`;
            const [keyframe, video, index, ...rest] = (value as string).split("&");
            console.log(video);
            const video_path = `L0${keyframe.split("=")[1]}_V${parseInt(video.split("=")[1]).toString().padStart(3, "0")}`;
            const img_path = (keyframe_id as any)[video_path][
              parseInt(index.split("=")[1])
            ].split("/");

            return (
              <div key={idx} className="relative aspect-w-1 aspect-h-1">
                <div className="font-bold text-xl">{`${video_path}/${img_path[img_path.length - 1]}`}</div>
                <div>{ }</div>
                <img src={keyframeUrl} alt="Image" />
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
