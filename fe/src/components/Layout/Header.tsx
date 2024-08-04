import Image from "next/image";
import { IoMdSearch } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import Navbar from "../Navbar/Navbar";
import DesktopSearch from "../Navbar/DesktopSearch";
import NavbarRight from "../Navbar/NavbarRight";
import DarkMode from "../Navbar/Darkmode";

// export default function Header() {
//   return (
//     <div className="flex h-[80px] px-5 py-2">
//       <div className="w-[280px] flex-shrink-0  flex items-center font-medium text-xl text-gray-700">
//         <Image className="w-7 h-7 mr-2 " src="logo.svg" alt="logo" width={400} height={400} />
//         Retrieval System
//       </div>
//       <div className="flex items-center justify-between py-5 w-full ">
//         <div className="w-[600px] p-4 flex items-center bg-slate-200 rounded-[50px]">
//           <IoMdSearch size={23} className="" />
//           <input
//             type="text"
//             className="border-none ml-3 bg-slate-200  outline-none w-full"
//             placeholder="Search in Retrieval System "
//           />
//         </div>
//         <div className="flex items-center">
//           <IoSettingsOutline size={30} className="mr-5 text-slate-600 hover:cursor-pointer" />
//           <MdOutlineEmail size={30} className="mr-5 text-slate-600 hover:cursor-pointer" />
//           <Image height={500} width={500} src="/nguyen.jpg" className=" rounded-full w-10 h-10" alt="" />
//         </div>
//       </div>
//     </div>
//   );
// }

export default function Header() {
  return (
    <header className="flex-shrink-0 border-b bg-sky-50">
      <div className="flex items-center justify-between p-2">
        <Navbar />



        <NavbarRight />
      </div>
    </header>
  );
}
