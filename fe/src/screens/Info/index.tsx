import { useAppDispatch, useAppSelector } from "@/src/store/store";
import { getUser, setUser } from "@/src/store/user/userSlice";
import Image from "next/image";
import { MdCameraAlt } from "react-icons/md";
import { GrFormNext } from "react-icons/gr";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { ModalContext } from "@/src/Providers/ModalProvider";
import { userApi } from "@/src/apis/user/user.api";
import { baseURL } from "@/src/apis/axios-base";

export default function Info() {
    const user: any = useAppSelector(getUser);
    const [avatarUrl, setAvatarUrl] = useState('/avatar.png');
    const { openModal, setModalComponent, closeModal }: any = useContext(ModalContext);
    const [file, setFile] = useState<File | undefined>();
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (!user?.avatar) return;
        setAvatarUrl(`${baseURL}/api/users/avatar?avatarId=${user.avatar}`);
    }, [user]);
    if (!user) return;

    const handleUpload = async (e: React.FormEvent<HTMLInputElement>) => {
        e.preventDefault();
        const target = e.target as HTMLInputElement & {
            files: FileList;
        };
        const file = target.files[0];
        if (!file) return;
        const formData = new FormData();
        if (file) {
            formData.set("file", file);
        }
        const res = await userApi.changeAvatar(formData);
        const data: any = await userApi.getMe();
        console.log(data);
        dispatch(setUser(data.user));
    };


    const ModalComponent = ({ name }: any) => {
        const [value, setValue] = useState(name);
        return (
            <div className="w-[360px] px-6 py-5 bg-white rounded-md flex flex-col items-start ">
                <div className="font-normal text-xl">Rename</div>
                <input
                    type="text"
                    autoFocus
                    className="outline-none mt-5 border-[1px] border-black rounded-lg py-2 px-3 focus:border-blue-400 w-full"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
                <div className="flex items-end w-full justify-end">
                    <div
                        className="mt-5 py-1 px-6 rounded-2xl bg-blue-500 hover:bg-blue-400 cursor-pointer text-white font-medium"
                        onClick={async () => {
                            await userApi.changeName(value);
                            const data: any = await userApi.getMe();
                            dispatch(setUser(data.user));
                            closeModal();
                        }}
                    >
                        OK
                    </div>
                </div>
            </div>
        );
    };

    const handleClickRename = () => {
        setModalComponent(<ModalComponent name={user.name} />);
        openModal();
    };

    return <div className="w-full  justify-center  flex">
        <div className="w-[800px]  flex flex-col  items-center ">
            <p className="text-3xl mt-4">Personal info</p>
            <p className="mt-3 text-base text-slate-600">Info about you and your preferences across Retrieve System services</p>
            <div className="w-full  min-h-10 border-[1px] rounded-lg border-gray-300  mt-5 overflow-hidden">
                <p className="text-2xl px-4 mt-5">Basic info</p>
                <div className="flex p-5">
                    <div className="w-[200px] items-center flex ">
                        <p className=" text-gray-600">Profile picture</p>
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p>A profile picture helps personalize your account</p>
                        <label htmlFor="input-file" className="w-20 h-20 relative rounded-full overflow-hidden cursor-pointer">
                            {avatarUrl && <Image
                                height={400}
                                width={400}
                                src={avatarUrl}
                                className=" rounded-full"
                                alt=""
                            />}
                            <div className="absolute w-full bottom-0 flex items-center justify-center bg-black bg-opacity-30 h-1/3 ">
                                <MdCameraAlt color="white" size={20} opacity={0.7} />
                            </div>
                            <input type="file" accept="image/*" id="input-file" hidden multiple={false} onChange={handleUpload} />

                        </label>

                    </div>

                </div>


                <div className="flex p-5 ">
                    <div className="w-[200px] items-center flex ">
                        <p className=" text-gray-600">Email</p>
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p>{user.email}</p>
                    </div>
                </div>

                <div className="flex p-5 hover:bg-gray-100 cursor-pointer"
                    onClick={handleClickRename}>
                    <div className="w-[200px] items-center flex ">
                        <p className=" text-gray-600">Name</p>
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p>{user.name}</p>
                        <GrFormNext size={23} color="gray" />
                    </div>
                </div>

                <div className="flex p-5 hover:bg-gray-100 cursor-pointer">
                    <div className="w-[200px] items-center flex ">
                        <p className=" text-gray-600">Gender</p>
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <p>Male</p>
                        <GrFormNext size={23} color="gray" />
                    </div>
                </div>
            </div>
        </div>
    </div>;


}
