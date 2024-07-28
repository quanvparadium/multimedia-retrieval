import Layout from "@/src/components/Layout";
import { useRouter } from "next/router";
import { useState, DragEvent, useEffect, useContext } from "react";
import Keyframe from "./Keyframe";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { queryApi } from "@/src/apis/query/query.api";


const data = [];

export default function Query() {
    const [file, setFile] = useState<File | undefined>();
    const { openMenu, closeMenu }: any = useContext(MenuContext);
    const [query, setQuery] = useState("");
    const [imageLink, setImageLink] = useState<string>();
    const [keyframes, setKeyframes] = useState([]);
    const router = useRouter();
    const [fileSystemId, setFileSystemId] = useState("");
    console.log(fileSystemId);

    useEffect(() => {
        const { fileSystemId }: any = router.query;
        if (fileSystemId) setFileSystemId(fileSystemId);
    }, [router.query]);


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
        const formData = new FormData();
        if (file) {
            // formData.append('blobs', file);
            formData.set("file", file);
        }
        formData.set("fileSystemId", fileSystemId);
        formData.append("query", query);
        formData.set("type", "video");
        const res = await queryApi.search(formData);
        console.log(res)
        // const res = await queryApi.get({ fileSystemId, query, type: "video" });
        setKeyframes(res.data);
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
            <div className="h-1/4 vh-3/4 p-4" onClick={closeMenu}>
                <form
                    className=" bg-indigo-50 rounded-3xl p-6"
                    // onClick = {() => {console.log('form')}}
                    onSubmit={handleOnSubmit}
                >
                    <div className="flex lg:col-span-4">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            name="search"
                            placeholder="Input your query"
                            autoComplete="off"
                            aria-label="Search talk"
                            className="w-full pr-3 pl-10 py-2 font-semibold placeholder-gray-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
                        />
                        <button
                            type="submit"
                            className="bg-blue-400  rounded-3xl ml-3 px-5 py-2 text-white font-semibold hover:text-black hover:opacity-50"
                        >
                            Submit
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-x-7 mt-3">
                        <div className="">
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
                                    className="w-full ml-5 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
                                ></input>
                            </div>
                            <div className="flex items-center px-2 py-1 justify-center mt-2">
                                <label
                                    htmlFor="Speech"
                                    className="block text-sm font-semibold text-gray-900 dark:text-white min-w-12 required"
                                >
                                    FolderID:
                                </label>
                                <input
                                    id="Speech"
                                    type="text"
                                    onChange={(e) => { setFileSystemId(e.target.value); }}
                                    value={fileSystemId}
                                    placeholder="Default is entire your folder"
                                    name="speech"
                                    autoComplete="off"
                                    aria-label="SpeechSearch"
                                    className="w-full ml-5 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
                                ></input>
                            </div>
                        </div>
                        <div className="">
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
                                    defaultValue={"Video"}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    {/* <option value="document">Document</option> */}
                                    {/* <option value="image">Image</option> */}
                                    <option value="video">Video</option>
                                </select>
                            </div>


                            <div className="flex items-center mt-2">
                                <label
                                    htmlFor="topk"
                                    className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required"
                                >
                                    TopK <span className="text-red-500">*</span> :
                                </label>

                                <select
                                    id="topk"
                                    defaultValue={3}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col ">
                            <div className="min-h-[140px]">
                                <label htmlFor="input-file" id="drop-area">
                                    <input type="file" accept="image/*" id="input-file" hidden multiple={false} onChange={handleUpload} />
                                    <div
                                        id="img-view"
                                        className=" h-full flex items-center justify-center bg-red-100 cursor-pointer rounded-3xl bg-center bg-no-repeat text-center border-dashed border-2 border-indigo-600 hover:opacity-50"
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





                        </div>
                    </div>





                </form>

                <div className="grid grid-cols-6 gap-5 mt-3 ">
                    {
                        keyframes.map((keyframe) => {
                            return <Keyframe keyframe={keyframe} />;
                        })
                    }
                </div>
            </div>
        </Layout>
    );
}
