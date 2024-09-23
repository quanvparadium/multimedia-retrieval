import Image from "next/image";
import Layout from "../components/Layout";
import HomeScreen from "../screens/Home";
import MenuProvider from "../Providers/MenuProvider";
import ModalProvider from "../Providers/ModalProvider";

export default function Home() {
  return (
    <Layout>
      <MenuProvider>
        <ModalProvider>
          <HomeScreen />
        </ModalProvider>

      </MenuProvider>
    </Layout>
  );
}
