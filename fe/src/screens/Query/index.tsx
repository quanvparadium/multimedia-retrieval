import Layout from "@/src/components/Layout";
import { useRouter } from "next/router";
import { useState, DragEvent, useEffect, useContext } from "react";
import Keyframe from "./Keyframe";
import { MenuContext } from "@/src/Providers/MenuProvider";
import { queryApi } from "@/src/apis/query/query.api";
import { Menu, Popover, } from "@headlessui/react";
import Checkbox from "@/src/components/CheckBox";
import { toggleElement } from "@/src/helpers/array";


const data = [];

export default function Query() {
    const [file, setFile] = useState<File | undefined>();
    const { openMenu, closeMenu }: any = useContext(MenuContext);
    const [query, setQuery] = useState("");
    const [use, setUse] = useState('text');
    const [type, setType] = useState('image');
    const [types, setTypes] = useState<string[]>(['all']);
    const [topK, setTopK] = useState(3);
    const [imageLink, setImageLink] = useState<string>();
    const [keyframes, setKeyframes] = useState([]);
    const router = useRouter();
    const [fileSystemId, setFileSystemId] = useState("");
    const [allTypes, setAllTypes] = useState<string[]>([]);


    useEffect(() => {
        if (use == 'text') setAllTypes(["image", "video", 'document', 'all']);
        else setAllTypes(["image", "video", 'all']);
    }, [use]);

    useEffect(() => {
        setTypes(['all']);
    }, [allTypes]);

    useEffect(() => {
        const { fileSystemId }: any = router.query;
        if (fileSystemId) setFileSystemId(fileSystemId);
    }, [router.query]);

    const handleType = (type: string) => {
        if (type == 'all') return setTypes(['all']);
        let nextTypes = toggleElement([...types], type).filter((item) => item != 'all');
        if (nextTypes.length == allTypes.length - 1) return setTypes(['all']);
        if (nextTypes.length == 0) return;
        setTypes(nextTypes);
    };

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
        if (file && use == 'image') {
            // formData.append('blobs', file);
            formData.set("file", file);
        }
        formData.set("fileSystemId", fileSystemId);
        formData.append("query", query);
        let submittedTypes;
        if (types.includes('all')) submittedTypes = allTypes.filter((type) => type != 'all');
        else submittedTypes = types;

        for (const type of submittedTypes) {
            formData.append("type", type);
        }
        formData.set("limit", String(topK));
        const res = await queryApi.search(formData);
        // console.log(res);
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
            <div className=" py-6 px-4" onClick={closeMenu}>

                <form
                    className=" bg-indigo-50 rounded-3xl p-6"
                    // onClick = {() => {console.log('form')}}
                    onSubmit={handleOnSubmit}
                >
                    <div className="flex mb-5">
                        <div className={`py-3 px-5  w-auto font-semibold rounded-3xl cursor-pointer ${use == 'text' ? 'bg-indigo-200' : 'hover:bg-indigo-100'}`} onClick={() => setUse('text')}>Using text</div>
                        <div className={`py-3 px-5  w-auto font-semibold rounded-3xl cursor-pointer ml-3 ${use == 'image' ? 'bg-indigo-200' : 'hover:bg-indigo-100'}`} onClick={() => setUse('image')}>Using image</div>
                    </div>
                    {use == 'text' && <div className="flex lg:col-span-4">
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
                    </div>}
                    {use == 'image' && <div className="flex flex-col my-2">
                        <div className="">
                            <label htmlFor="input-file" id="drop-area">
                                <input type="file" accept="image/*" id="input-file" hidden multiple={false} onChange={handleUpload} />
                                <div
                                    id="img-view"
                                    className="py-3 min-h-[140px] h-full flex items-center justify-center bg-red-100 cursor-pointer rounded-3xl bg-center bg-no-repeat text-center border-dashed border-2 border-indigo-600 hover:opacity-50"
                                    style={{
                                        backgroundImage: imageLink ? `url(${imageLink})` : undefined,
                                        border: imageLink ? "1px solid gray" : undefined,
                                        borderRadius: imageLink ? "1rem" : undefined,
                                        backgroundPosition: imageLink ? "center" : undefined,
                                        backgroundSize: imageLink ? "contain" : undefined,

                                        // backgroundRepeat: imageLink ? '' : undefined,
                                        width: imageLink ? '100%' : undefined,
                                        minHeight: ''
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
                    </div>}
                    <div className="grid grid-cols-3 gap-x-7 mt-5">
                        <div className="">
                            <div className="flex items-center px-2 justify-center ">
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
                        <div className=" items-center relative">
                            <Popover>
                                <Popover.Button className="bg-gray-50 border tracking-wide  border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    {types.map((item) => item.toUpperCase()).join(',')}
                                </Popover.Button>
                                <Popover.Panel
                                    className="absolute bg-white mt-1 cursor-pointer overflow-clip border-[1px] flex  flex-col border-gray-300 rounded-xl w-full bg-white/5 text-sm/6 transition duration-200 ease-in-out "
                                >

                                    {allTypes.map((type) => {
                                        return <div className="hover:bg-blue-200 bg-white flex justify-center py-2 capitalize" key={type} onClick={() => handleType(type)} >
                                            <Checkbox checked={types.includes(type)} label={type} />
                                        </div>;
                                    })}

                                </Popover.Panel>
                            </Popover>

                        </div>
                        <div className="flex items-center">
                            <label
                                htmlFor="topk"
                                className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required"
                            >
                                TopK <span className="text-red-500">*</span> :
                            </label>

                            <select
                                id="topk"
                                defaultValue={topK}
                                onChange={(e) => setTopK(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>


                    </div>


                    <div className="flex">
                        <button
                            type="submit"
                            className="bg-blue-400  rounded-2xl px-5 py-2 mt-5 text-white font-semibold  hover:opacity-70"
                        >
                            Submit
                        </button>
                    </div>


                </form>


                {keyframes && Object.entries(keyframes).map(([type, _keyframes]: any) => {
                    if (!_keyframes?.length) return;
                    return <div className="">
                        <div className="font-medium text-gray-600 capitalize mt-5 text-lg">{type}</div>
                        <div className="grid grid-cols-6 gap-5 mt-3 ">
                            {
                                _keyframes.map((keyframe: any) => {
                                    return <Keyframe keyframe={keyframe} />;
                                })
                            }
                        </div>
                    </div>;
                })}
            </div>
        </Layout>
    );
}
