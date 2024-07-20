import { IoMdSearch } from "react-icons/io";
import DropdownMenu from "./Menu/DropdownMenu";

export default function NavbarRight() {
  return (
    <div className="relative flex items-center space-x-3">
      <button
        className="p-2 bg-gray-100 rounded-full md:hidden focus:outline-none focus:ring hover:bg-gray-200"
        aria-label="Search"
      >
        <IoMdSearch size={23} className="" />
      </button>
      {/* CSS responsive sau cho button này */}
      <div className="items-center hidden space-x-3 md:flex">
        <DropdownMenu />
      </div>
    </div>
  );
}
