import Image from "next/image";
import Layout from "../components/Layout";
import HomeScreen from "../screens/Home";
import MenuProvider from "../screens/InFolder/MenuProvider";
import ModalProvider from "../screens/InFolder/ModalProvider";

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
