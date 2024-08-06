import Navbar from "../Navbar/Navbar";
import NavbarRight from "../Navbar/NavbarRight";



export default function Header({ isNav = true }: any) {
  return (
    <header className="flex-shrink-0 border-b bg-sky-50">
      {isNav && <div className="flex items-center justify-between p-2">
        <Navbar />
        <NavbarRight />
      </div>}
      {!isNav && <div className="flex items-center justify-end p-2">
        <NavbarRight />
      </div>}
    </header>
  );
}
