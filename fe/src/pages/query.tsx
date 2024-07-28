import MenuProvider from "../Providers/MenuProvider";
import ModalProvider from "../Providers/ModalProvider";
import Query from "../screens/Query";

export default function Home() {
  return <MenuProvider>
    <ModalProvider>
      <Query />
    </ModalProvider>
  </MenuProvider>;
}
