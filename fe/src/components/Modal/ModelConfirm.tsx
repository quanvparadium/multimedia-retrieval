export default function ModalConfirm({ title, closeModal, onClick, content }: any) {
    return (
        <div className="w-[500px] px-6 py-5 bg-white rounded-md flex flex-col items-start ">
            <div className=" text-2xl">{title}</div>
            <p className="mt-5 text-left text-sm text-gray-600">{content}</p>
            <div className="flex items-end w-full justify-end">
                <div
                    className="mt-5 py-2 px-6 rounded-3xl text-blue-500 hover:bg-slate-100 cursor-pointer  font-medium mr-5"
                    onClick={closeModal}
                >
                    Cancle
                </div>
                <div
                    className="mt-5 py-2 px-6 rounded-3xl bg-blue-500 hover:bg-blue-400 cursor-pointer text-white font-medium"
                    onClick={onClick}
                >
                    Confirm
                </div>
            </div>
        </div>
    );
};