import React from "react";
import Image from "next/image";
import { FaRegBell } from "react-icons/fa";
import { HiOutlineViewGrid } from "react-icons/hi";
import { MdPayment } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { useAppSelector } from "@/src/store/store";
import { getUser } from "@/src/store/user/userSlice";
import { useRouter } from "next/router";

export default function DropdownMenu() {
  const user: any = useAppSelector(getUser);
  const router = useRouter();
  return (
    <div>
      {/* Notification */}
      <Dropdown as="div" className="relative inline-block">
        <Dropdown.Button className="mx-2 p-2 bg-gray-100 rounded-full hover:bg-gray-300 focus:outline-none focus:ring">
          <FaRegBell className="w-6 h-6 text-gray-500" />
        </Dropdown.Button>

        <Dropdown.Items className="absolute z-50 w-48 max-w-md mt-4 transform bg-white rounded-md shadow-lg -translate-x-3/4 min-w-max">
          <div className="p-3 font-medium border-b">
            <span className="text-gray-800">Notification</span>
          </div>
          <ul className="flex flex-col p-2 space-y-1">
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Link
              </a>
            </li>
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Another Link
              </a>
            </li>
          </ul>
          <div className="flex items-center justify-center p-4 text-blue-700 underline border-t">
            <a href="#">See All</a>
          </div>
        </Dropdown.Items>
      </Dropdown>

      {/* Services */}
      <Dropdown as="div" className="relative inline-block">
        <Dropdown.Button className="mx-2 p-2 bg-gray-100 rounded-full hover:bg-gray-300 focus:outline-none focus:ring">
          <HiOutlineViewGrid className="w-6 h-6 text-gray-500" />
        </Dropdown.Button>

        <Dropdown.Items className="absolute z-50 w-48 max-w-md mt-4 transform bg-white rounded-md shadow-lg -translate-x-3/4 min-w-max">
          <div className="p-3 font-medium border-b">
            <span className="text-gray-800">Services</span>
          </div>
          <ul className="flex flex-col p-2 space-y-1">
            <li>
              <a
                href="#"
                className="flex items-start px-2 py-1 space-x-2 rounded-md hover:bg-gray-100"
              >
                <MdPayment className="w-6 h-6 text-gray-500" />
                <span className="flex flex-col">
                  <span className="text-lg">Payment</span>
                  <span className="text-sm text-gray-400">Lorem ipsum dolor sit.</span>
                </span>
              </a>
            </li>
          </ul>
          <div className="flex items-center justify-center p-4 text-blue-700 underline border-t">
            <a href="#">See All</a>
          </div>
        </Dropdown.Items>
      </Dropdown>

      {/* Settings */}
      <Dropdown as="div" className="relative inline-block">
        <Dropdown.Button className="mx-2 p-2 bg-gray-100 rounded-full hover:bg-gray-300 focus:outline-none focus:ring">
          {/* <HiOutlineViewGrid className="w-6 h-6 text-gray-500"/> */}
          <IoSettingsOutline className="w-6 h-6 text-gray-500" />
        </Dropdown.Button>

        <Dropdown.Items className="absolute z-50 w-48 max-w-md mt-4 transform bg-white rounded-md shadow-lg -translate-x-3/4 min-w-max">
          <div className="p-3 font-medium border-b">
            <span className="text-gray-800">Settings</span>
          </div>
          <ul className="flex flex-col p-2 space-y-1">
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Settings
              </a>
            </li>
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Download Desktop
              </a>
            </li>
          </ul>
        </Dropdown.Items>
      </Dropdown>

      {/* Profile */}
      <Dropdown as="div" className="relative top-1.5 inline-block">
        <Dropdown.Button className="mx-2 bg-gray-100 rounded-full hover:bg-gray-300 focus:outline-none focus:ring">
          {/* <HiOutlineViewGrid className="w-6 h-6 text-gray-500"/> */}
          {/* <IoSettingsOutline className="w-6 h-6 text-gray-500"/> */}
          <Image
            height={500}
            width={500}
            src="/nguyen.jpg"
            className="rounded-full w-9 h-9 "
            alt=""
          />
        </Dropdown.Button>
        <Dropdown.Items className="absolute z-50 w-48 max-w-md mt-4 transform bg-white rounded-md shadow-lg -translate-x-[84%] min-w-max">
          <div className="flex flex-col p-4 space-y-1 font-medium border-b">
            <span className="text-gray-800">{user?.name}</span>
            <span className="text-sm text-gray-400">{user?.email}</span>
          </div>

          <ul className="flex flex-col p-2 my-2 space-y-1">
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Profile
              </a>
            </li>
            <li>
              <a href="#" className="block px-2 py-2 transition rounded-md hover:bg-gray-100">
                Add another account
              </a>
            </li>
          </ul>
          <div
            className="flex items-center justify-center px-2 py-2 text-blue-700 underline border-t cursor-pointer hover:bg-gray-100"
            onClick={(e) => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.push("/login");
            }}
          >
            <p>Logout</p>
          </div>
        </Dropdown.Items>
      </Dropdown>
    </div>
  );
}

function useOnClickOutside(ref: any, handler: any) {
  React.useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// dropdown components
const DropdownContext = React.createContext({});

function Dropdown(props: any) {
  const [isOpen, setIsOpen] = React.useState(false);

  const As = props.as;
  const ref = React.useRef(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <As ref={ref} {...props}>
        {props.children}
      </As>
    </DropdownContext.Provider>
  );
}

function Button(props: any) {
  const { setIsOpen, isOpen }: any = React.useContext(DropdownContext);

  return (
    <button onClick={() => setIsOpen(!isOpen)} {...props}>
      {props.children}
    </button>
  );
}

function Items(props: any) {
  const { isOpen }: any = React.useContext(DropdownContext);
  return isOpen ? <div {...props}>{props.children}</div> : null;
}

function Item(props: any) {
  const As = props.as;

  return <As {...props}>{props.children}</As>;
}

Dropdown.Button = Button;
Dropdown.Items = Items;
Dropdown.Item = Item;
