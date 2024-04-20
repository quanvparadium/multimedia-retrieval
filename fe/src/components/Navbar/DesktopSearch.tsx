
import { IoMdSearch} from "react-icons/io";

export default function DesktopSearch () {
    return (
        <div className="items-center hidden px-2 space-x-2 md:flex-1 md:flex md:mr-auto md:ml-5">
            <IoMdSearch size={23} className="" />
            <input type="text" placeholder="Search" className="px-4 py-3 rounded-md hover:bg-gray-100 lg:max-w-sm md:py-2 md:flex-1 focus:outline-none md:focus:bg-gray-100 md:focus:shadow md:focus:border"/>
        </div>
    )
}