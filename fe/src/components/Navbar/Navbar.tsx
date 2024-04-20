import { FaAngleDoubleRight, FaAngleDoubleLeft } from "react-icons/fa";
import { useContext } from "react";
import { SidebarContext } from "../Layout/SidebarContext";
import Image from "next/image";

export default function Navbar (){
    const {isSidebarOpen, setSidebarOpen}: any = useContext(SidebarContext)
    const toggleSidbarMenu = () => {
        setSidebarOpen(!isSidebarOpen);
    }
    return (
        <div className="flex items-center space-x-3 p-2">
        {/* <span className="p-2 text-xl font-semibold tracking-wider uppercase lg:hidden">K-WD</span> */}
        <Image className="w-8 h-8 lg:hidden" src="logo.svg" alt="logo" width={400} height={400} />

        {/* Toggle sidebar button */}
        <button onClick={() => toggleSidbarMenu()} className="p-2 rounded-md focus:outline-none focus:ring">
            {isSidebarOpen ? <FaAngleDoubleLeft/> : <FaAngleDoubleRight/>}

        </button>
        </div>
        
    )
}